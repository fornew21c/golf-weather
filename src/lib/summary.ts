import type { CurrentWeather, GolfScore, HourlyForecast } from "./types";

/**
 * 로컬 규칙 기반 자연어 요약 생성기.
 * 외부 AI를 전혀 사용하지 않고 날씨 신호로 짧은 한국어 문장을 조합하므로
 * 오프라인에서도 동작하며 결과가 항상 결정적이다.
 */
interface SummaryInputs {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  score: GolfScore;
}

/** 친근한 표현을 위한 시간대 구분. */
function partOfDay(hourLocal: number): "오전" | "오후" | "저녁" {
  if (hourLocal < 11) return "오전";
  if (hourLocal < 17) return "오후";
  return "저녁";
}

export function generateGolfSummary({
  current,
  hourly,
  score,
}: SummaryInputs): string {
  const parts: string[] = [];

  // 전체 등급에 따른 첫 문장.
  const localHour = new Date(current.dt * 1000).getUTCHours();
  const tod = partOfDay(localHour);

  switch (score.rating) {
    case "Excellent":
      parts.push(`${tod} 라운딩에 완벽한 날씨예요.`);
      break;
    case "Good":
      parts.push(`${tod} 라운딩하기 좋은 날씨예요.`);
      break;
    case "Playable":
      parts.push(`${tod} 라운딩 가능하지만 몇 가지 유의할 점이 있어요.`);
      break;
    case "Tough Conditions":
      parts.push(`${tod} 코스 컨디션이 다소 까다로워요.`);
      break;
  }

  // 바람 — 향후 8시간 동안 최대 풍속을 확인.
  const maxWindNext = hourly
    .slice(0, 8)
    .reduce((m, h) => Math.max(m, h.windSpeed), 0);
  if (maxWindNext >= 8) {
    parts.push("강한 바람이 장타와 클럽 선택에 영향을 줄 수 있어요.");
  } else if (maxWindNext >= 5) {
    parts.push("약간의 바람이 어프로치 샷에 영향을 줄 수 있어요.");
  } else if (current.windSpeed < 2) {
    parts.push("바람이 잔잔해 스코어 내기 좋아요.");
  }

  // 비 — 향후 8시간 동안 최대 강수 확률.
  const peakPop = hourly.slice(0, 8).reduce((m, h) => Math.max(m, h.pop), 0);
  if (peakPop >= 0.6) {
    parts.push("비 소식이 있으니 우비를 챙기세요.");
  } else if (peakPop >= 0.3) {
    parts.push("지나가는 소나기가 내릴 수 있어요.");
  }

  // 기온 / 습도 쾌적도.
  if (current.temp <= 5) {
    parts.push("쌀쌀하니 따뜻하게 입으세요.");
  } else if (current.temp >= 30) {
    parts.push("더위에 수분 보충을 잊지 마세요.");
  } else if (current.humidity >= 80 && peakPop < 0.6) {
    parts.push("습도가 높지만 플레이하기엔 무난해요.");
  }

  // 자외선.
  if (current.uvi >= 8) {
    parts.push("자외선이 매우 강하니 선크림을 발라주세요.");
  }

  return parts.join(" ");
}
