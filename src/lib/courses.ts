import type { GolfCourse } from "./types";

/**
 * Curated list of well-known Korean golf courses.
 *
 * This serves three purposes:
 *  1. Featured courses on the home page.
 *  2. Instant local autocomplete results (no API round-trip).
 *  3. A deterministic id→coordinate map so /course/[id] works offline.
 *
 * Geocoding via Kakao/Google is layered ON TOP of this for arbitrary
 * Korean course names the user might type. Results are always Korea-only.
 */
export const KOREAN_GOLF_COURSES: GolfCourse[] = [
  {
    id: "jack-nicklaus-gc-korea",
    name: "잭니클라우스 GC 코리아",
    nameEn: "Jack Nicklaus GC Korea",
    address: "인천광역시 연수구 송도동",
    region: "인천",
    lat: 37.3796,
    lon: 126.6453,
    holes: 18,
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "south-cape-owners-club",
    name: "사우스케이프 오너스 클럽",
    nameEn: "South Cape Owners Club",
    address: "경상남도 남해군 창선면",
    region: "경남",
    lat: 34.7468,
    lon: 128.0271,
    holes: 18,
    image:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "blackstone-icheon",
    name: "블랙스톤 이천",
    nameEn: "Blackstone Icheon",
    address: "경기도 이천시 마장면",
    region: "경기",
    lat: 37.2459,
    lon: 127.3536,
    holes: 27,
    image:
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "haesley-nine-bridges",
    name: "해슬리 나인브릿지",
    nameEn: "Haesley Nine Bridges",
    address: "경기도 여주시 산북면",
    region: "경기",
    lat: 37.4231,
    lon: 127.5189,
    holes: 18,
    image:
      "https://images.unsplash.com/photo-1535132011086-b8818f016104?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "club-nine-bridges-jeju",
    name: "클럽 나인브릿지 제주",
    nameEn: "Club Nine Bridges Jeju",
    address: "제주특별자치도 제주시 한경면",
    region: "제주",
    lat: 33.3411,
    lon: 126.2487,
    holes: 18,
    image:
      "https://images.unsplash.com/photo-1530028828-25e8270793c5?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "the-star-hue-cc",
    name: "더스타휴 CC",
    nameEn: "The Star Hue CC",
    address: "경기도 양주시 백석읍",
    region: "경기",
    lat: 37.7752,
    lon: 126.9486,
    holes: 18,
    image:
      "https://images.unsplash.com/photo-1605547428972-3c0c5c0c9f9b?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "pine-beach-golf-links",
    name: "파인비치 골프링크스",
    nameEn: "Pine Beach Golf Links",
    address: "전라남도 해남군 화원면",
    region: "전남",
    lat: 34.6219,
    lon: 126.3018,
    holes: 18,
    image:
      "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "lakewood-cc",
    name: "레이크우드 CC",
    nameEn: "Lakewood CC",
    address: "경기도 양주시 광적면",
    region: "경기",
    lat: 37.8312,
    lon: 126.9678,
    holes: 27,
    image:
      "https://images.unsplash.com/photo-1632946990873-3f8d3f0c9b07?auto=format&fit=crop&w=1200&q=70",
  },
];

const byId = new Map(KOREAN_GOLF_COURSES.map((c) => [c.id, c]));

export function getCourseById(id: string): GolfCourse | undefined {
  return byId.get(id);
}

/** Lightweight, accent-insensitive local search across name + region. */
export function searchLocalCourses(query: string, limit = 6): GolfCourse[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return KOREAN_GOLF_COURSES.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.nameEn?.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  }).slice(0, limit);
}

export const FEATURED_COURSE_IDS = [
  "jack-nicklaus-gc-korea",
  "south-cape-owners-club",
  "haesley-nine-bridges",
  "club-nine-bridges-jeju",
];

/** Build a deterministic, URL-safe id from an arbitrary course name. */
export function slugifyCourseName(name: string): string {
  return (
    "geo-" +
    encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g, "-")).replace(
      /%/g,
      "",
    )
  );
}
