import type { GolfCourse } from "./types";
import { searchLocalCourses, slugifyCourseName } from "./courses";

/**
 * Geocoding restricted to KOREA only.
 *
 * Resolution order:
 *  1. Curated local courses (instant, no network).
 *  2. Kakao Local API (Korea-native; results are inherently domestic).
 *  3. Google Places API (constrained to region=kr + a Korea bounding box).
 *
 * Any result whose coordinates fall outside the Korean bounding box is
 * discarded, guaranteeing Korea-only output regardless of provider.
 */

// Approx. bounding box covering South Korea (incl. Jeju).
const KOREA_BBOX = { minLat: 33.0, maxLat: 38.7, minLon: 124.5, maxLon: 132.0 };

function isInKorea(lat: number, lon: number): boolean {
  return (
    lat >= KOREA_BBOX.minLat &&
    lat <= KOREA_BBOX.maxLat &&
    lon >= KOREA_BBOX.minLon &&
    lon <= KOREA_BBOX.maxLon
  );
}

/** Bias golf-related queries by appending the keyword when missing. */
function golfQuery(query: string): string {
  return /골프|gc|cc|골프장|club|links/i.test(query) ? query : `${query} 골프장`;
}

async function geocodeKakao(query: string): Promise<GolfCourse[]> {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) return [];

  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", golfQuery(query));
  url.searchParams.set("category_group_code", "AT4"); // 관광명소 covers many courses
  url.searchParams.set("size", "10");

  try {
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
      next: { revalidate: 60 * 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      documents: {
        place_name: string;
        address_name: string;
        road_address_name?: string;
        region_1depth_name?: string;
        x: string; // lon
        y: string; // lat
      }[];
    };
    return data.documents
      .map((d) => {
        const lat = parseFloat(d.y);
        const lon = parseFloat(d.x);
        return {
          id: slugifyCourseName(d.place_name),
          name: d.place_name,
          address: d.road_address_name || d.address_name,
          region: d.region_1depth_name ?? "대한민국",
          lat,
          lon,
        } satisfies GolfCourse;
      })
      .filter((c) => isInKorea(c.lat, c.lon));
  } catch {
    return [];
  }
}

async function geocodeGoogle(query: string): Promise<GolfCourse[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json",
  );
  url.searchParams.set("query", golfQuery(query));
  url.searchParams.set("region", "kr"); // bias to Korea
  url.searchParams.set("language", "ko");
  // Bias toward the geographic center of South Korea.
  url.searchParams.set("location", "36.5,127.8");
  url.searchParams.set("radius", "400000");
  url.searchParams.set("key", key);

  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 } });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results: {
        name: string;
        formatted_address: string;
        geometry: { location: { lat: number; lng: number } };
      }[];
    };
    return data.results
      .map((r) => ({
        id: slugifyCourseName(r.name),
        name: r.name,
        address: r.formatted_address,
        region: r.formatted_address.split(" ")[0] ?? "대한민국",
        lat: r.geometry.location.lat,
        lon: r.geometry.location.lng,
      }))
      .filter(
        (c) =>
          isInKorea(c.lat, c.lon) &&
          // Drop obviously non-Korean addresses.
          /(대한민국|South Korea|Korea|도|시|군|구)/.test(c.address),
      );
  } catch {
    return [];
  }
}

/** Merge results, de-duplicating by id and capping the list. */
export async function searchCourses(
  query: string,
  limit = 8,
): Promise<{ results: GolfCourse[]; source: "local" | "kakao" | "google" | "mixed" }> {
  const trimmed = query.trim();
  if (!trimmed) return { results: [], source: "local" };

  const local = searchLocalCourses(trimmed, limit);

  // Prefer the provider that has a key. Kakao first (Korea-native).
  const remote = process.env.KAKAO_REST_API_KEY
    ? await geocodeKakao(trimmed)
    : await geocodeGoogle(trimmed);

  const source: "local" | "kakao" | "google" | "mixed" = remote.length
    ? process.env.KAKAO_REST_API_KEY
      ? local.length
        ? "mixed"
        : "kakao"
      : local.length
        ? "mixed"
        : "google"
    : "local";

  const merged: GolfCourse[] = [];
  const seen = new Set<string>();
  for (const c of [...local, ...remote]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    merged.push(c);
    if (merged.length >= limit) break;
  }

  return { results: merged, source };
}
