// @ts-check
/**
 * 골프장 시드 데이터 빌드 스크립트 (OpenStreetMap Nominatim 버전)
 * ---------------------------------------------------------------------------
 * data.go.kr "전국 골프장 현황" CSV를 읽어 각 골프장 주소를
 * OSM Nominatim(키 불필요·무료)으로 좌표(위/경도)로 변환한 뒤,
 * 앱이 사용하는 `src/data/golf-courses.json`을 생성한다.
 *
 * 사용법:
 *   node scripts/build-courses.mjs [csv경로]
 *   npm run build:courses -- "/path/to/전국 골프장 현황.csv"
 *
 * 특징:
 *   - 업소명 검색 우선, 실패 시 주소 검색으로 폴백
 *   - countrycodes=kr + 한국 bounding box 로 Korea-only 보장
 *   - Nominatim 이용약관 준수: 1 req/s throttle + User-Agent 헤더
 *   - 진행 캐시로 중단 후 재실행(resume) 지원
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DEFAULT_CSV =
  "/Users/wch.heo/Downloads/문화체육관광부_전국 골프장 현황_20221231.csv";
const OUTPUT = path.join(ROOT, "src", "data", "golf-courses.json");
const CACHE = path.join(__dirname, ".courses-cache.json"); // id → coords (성공분)
const QCACHE = path.join(__dirname, ".geocode-qcache.json"); // query → coords|null

// 대한민국(제주 포함) 대략적 bounding box.
const KOREA_BBOX = { minLat: 33.0, maxLat: 38.7, minLon: 124.5, maxLon: 132.0 };
// Nominatim 약관: 최대 1 req/s. 여유를 둬 1.1s.
const THROTTLE_MS = 1100;
const USER_AGENT = "GolfWeather/1.0 (one-time golf course geocoding build)";

/* --------------------------- CSV 파서 (RFC4180) ------------------------- */
/** 따옴표/콤마/개행을 처리하는 최소 CSV 파서. @returns {string[][]} */
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM 제거
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/* ------------------------------ 유틸 ----------------------------------- */
/** djb2 해시 기반의 안정적·URL-safe 한 id. */
function hashId(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "gc-" + h.toString(36);
}

const normalizeName = (s) => s.replace(/\s+/g, "").toLowerCase();
const isInKorea = (lat, lon) =>
  lat >= KOREA_BBOX.minLat &&
  lat <= KOREA_BBOX.maxLat &&
  lon >= KOREA_BBOX.minLon &&
  lon <= KOREA_BBOX.maxLon;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------- Nominatim 지오코딩 -------------------------- */
let lastReq = 0;
/** 모든 HTTP 호출 사이에 최소 THROTTLE_MS 간격을 강제한다. */
async function throttle() {
  const wait = lastReq + THROTTLE_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastReq = Date.now();
}

/** 쿼리 단위 캐시(성공·실패 모두 기록) — 재실행 시 중복 호출 방지. @type {Record<string, {lat:number,lon:number}|null>} */
let qcache = {};

/** OSM Nominatim 자유 검색 (키 불필요). @returns {Promise<{lat:number,lon:number}|null>} */
async function nominatim(query) {
  if (query in qcache) return qcache[query]; // 캐시된 결과(null 포함)는 호출 생략
  await throttle();
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "kr");
  url.searchParams.set("accept-language", "ko");
  let result = null;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) {
      const data = await res.json();
      const d = Array.isArray(data) ? data[0] : null;
      if (d) {
        const lat = parseFloat(d.lat);
        const lon = parseFloat(d.lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) result = { lat, lon };
      }
    }
  } catch {
    result = null;
  }
  qcache[query] = result;
  return result;
}

/* ------------------------------ main ----------------------------------- */
async function main() {
  const csvPath = process.argv[2] || DEFAULT_CSV;
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV를 찾을 수 없습니다: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📄 CSV 읽는 중: ${csvPath}`);
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const header = rows.shift() ?? [];
  console.log(`   컬럼: ${header.join(" | ")}`);
  console.log(`   데이터 ${rows.length}행 · 지오코더: OSM Nominatim (~1 req/s)`);

  // 컬럼 인덱스: 지역, 업소명, 사업자명, 소재지, 총면적, 홀수, 세부종류
  const COL = { region: 0, name: 1, address: 3, holes: 5, type: 6 };

  /** @type {Record<string, any>} */
  let cache = {};
  if (fs.existsSync(CACHE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE, "utf8"));
      console.log(`   id 캐시에서 ${Object.keys(cache).length}건 로드`);
    } catch {}
  }
  if (fs.existsSync(QCACHE)) {
    try {
      qcache = JSON.parse(fs.readFileSync(QCACHE, "utf8"));
      console.log(`   쿼리 캐시에서 ${Object.keys(qcache).length}건 로드`);
    } catch {}
  }

  const seenName = new Set();
  const out = [];
  let ok = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const region = (r[COL.region] || "").trim();
    const name = (r[COL.name] || "").trim();
    const sojaeji = (r[COL.address] || "").trim();
    const holesRaw = parseInt((r[COL.holes] || "").trim(), 10);
    const type = (r[COL.type] || "").trim();
    if (!name || !region) continue;

    const nkey = normalizeName(name);
    if (seenName.has(nkey)) continue; // 동일 업소명 중복 제거
    seenName.add(nkey);

    const fullAddress = `${region} ${sojaeji}`.trim();
    const id = hashId(`${region}|${name}`);

    let coords = cache[id];
    if (!coords) {
      // OSM은 한국 골프장 POI명을 잘 못 찾으므로 주소 검색을 우선한다.
      // 1) 전체 주소  2) 소재지  3) 업소명+골프장
      // 4) 시/군/구 행정구역(최후 폴백) — 날씨는 지역 단위면 충분하므로
      //    상세 주소가 안 잡히면 시·군 중심 좌표라도 채워 커버리지를 확보한다.
      const cityToken = (sojaeji.match(/([가-힣]+(?:시|군|구))/) || [])[1] || "";
      coords =
        (await nominatim(fullAddress)) ||
        (sojaeji ? await nominatim(sojaeji) : null) ||
        (await nominatim(`${name} 골프장`)) ||
        (cityToken ? await nominatim(`${region} ${cityToken}`) : null);
    }

    // 매 10행마다 두 캐시를 저장 (성공·실패 무관하게 재실행 안전성 확보)
    if (i % 10 === 0) {
      fs.writeFileSync(QCACHE, JSON.stringify(qcache));
      fs.writeFileSync(CACHE, JSON.stringify(cache));
    }

    if (!coords || !isInKorea(coords.lat, coords.lon)) {
      failed++;
      console.log(`  [${i + 1}/${rows.length}] ✗ 실패: ${name}  (✓${ok} ✗${failed})`);
      continue;
    }

    cache[id] = coords;
    out.push({
      id,
      name,
      address: fullAddress,
      region,
      lat: coords.lat,
      lon: coords.lon,
      ...(Number.isFinite(holesRaw) ? { holes: holesRaw } : {}),
      ...(type ? { type } : {}),
    });
    ok++;
    if (ok % 20 === 0 || i === rows.length - 1) {
      console.log(`  [${i + 1}/${rows.length}] 진행 중… (✓${ok} ✗${failed})`);
    }
  }

  fs.writeFileSync(QCACHE, JSON.stringify(qcache));
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  out.sort(
    (a, b) =>
      a.region.localeCompare(b.region, "ko") ||
      a.name.localeCompare(b.name, "ko"),
  );
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + "\n");

  console.log(
    `\n✅ 완료: ${out.length}곳 저장 → ${path.relative(ROOT, OUTPUT)}` +
      `  (성공 ${ok} / 실패 ${failed})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
