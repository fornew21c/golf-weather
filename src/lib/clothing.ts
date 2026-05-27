import type { ClothingRecommendation, CurrentWeather, HourlyForecast } from "./types";

/**
 * 규칙 기반 복장 & 장비 추천 (한국어).
 * 헤드라인과 추천 아이템 목록, 우산 필요 여부를 반환한다.
 */
export function recommendClothing(
  current: CurrentWeather,
  hourly: HourlyForecast[],
): ClothingRecommendation {
  const items: { icon: string; label: string }[] = [];
  const temp = current.feelsLike;
  const peakPop = hourly
    .slice(0, 8)
    .reduce((m, h) => Math.max(m, h.pop), current.rain1h ? 0.6 : 0);
  const maxWind = hourly
    .slice(0, 8)
    .reduce((m, h) => Math.max(m, h.windSpeed), current.windSpeed);

  let title: string;

  // 체감 온도 기준 기본 레이어.
  if (temp >= 26) {
    title = "가볍고 시원하게";
    items.push({ icon: "shirt", label: "가벼운 폴로셔츠" });
    items.push({ icon: "glasses", label: "선글라스 & 모자" });
  } else if (temp >= 16) {
    title = "쾌적한 레이어드";
    items.push({ icon: "shirt", label: "폴로셔츠" });
    items.push({ icon: "layers", label: "얇은 미드레이어" });
  } else if (temp >= 8) {
    title = "따뜻한 레이어드";
    items.push({ icon: "layers", label: "긴팔 + 스웨터" });
    items.push({ icon: "wind", label: "바람막이" });
  } else {
    title = "단단히 챙겨 입기";
    items.push({ icon: "thermometer-snowflake", label: "기모 베이스레이어" });
    items.push({ icon: "layers", label: "보온 재킷" });
    items.push({ icon: "hand", label: "방한 장갑" });
  }

  // 바람 대비 레이어.
  if (maxWind >= 6 && temp >= 8) {
    items.push({ icon: "wind", label: "바람막이" });
  }

  // 우천 대비 장비.
  const umbrella = peakPop >= 0.4;
  if (peakPop >= 0.6) {
    items.push({ icon: "cloud-rain", label: "레인 재킷" });
    items.push({ icon: "umbrella", label: "우산" });
  } else if (peakPop >= 0.4) {
    items.push({ icon: "umbrella", label: "접이식 우산" });
  }

  // 자외선 차단.
  if (current.uvi >= 6) {
    items.push({ icon: "sun", label: "선크림 SPF 50" });
  }

  // 라벨 기준 중복 제거(순서 유지).
  const seen = new Set<string>();
  const deduped = items.filter((i) =>
    seen.has(i.label) ? false : (seen.add(i.label), true),
  );

  return { title, items: deduped, umbrella };
}
