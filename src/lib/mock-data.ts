import type {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  WeatherBundle,
  WeatherCondition,
} from "./types";

/**
 * Deterministic, realistic mock weather generator.
 * Used whenever OPENWEATHER_API_KEY is absent so the full UI is testable
 * with no external account. Seeded by lat/lon so each course is consistent
 * within a render but varies plausibly across courses and time of day.
 */

function seeded(lat: number, lon: number): () => number {
  // Simple LCG seeded by coordinates + current hour bucket.
  let state =
    Math.floor(Math.abs(lat * 1000) + Math.abs(lon * 1000)) +
    new Date().getUTCHours() * 7;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const CONDITIONS: WeatherCondition[] = ["clear", "clouds", "rain", "clouds", "clear"];
const ICONS: Record<WeatherCondition, string> = {
  clear: "01d",
  clouds: "03d",
  rain: "10d",
  drizzle: "09d",
  thunderstorm: "11d",
  snow: "13d",
  mist: "50d",
  fog: "50d",
};
const DESCRIPTIONS: Record<WeatherCondition, string> = {
  clear: "clear sky",
  clouds: "scattered clouds",
  rain: "light rain",
  drizzle: "light drizzle",
  thunderstorm: "thunderstorm",
  snow: "light snow",
  mist: "mist",
  fog: "fog",
};

export function buildMockWeather(lat: number, lon: number): WeatherBundle {
  const rand = seeded(lat, lon);
  const now = Math.floor(Date.now() / 1000);
  const tzOffset = 9 * 3600; // KST, Korea-only app.

  // Latitude-aware base temperature: cooler north, warmer south.
  const baseTemp = 22 - (lat - 34) * 1.1 + (rand() - 0.5) * 4;
  const baseHumidity = 45 + Math.floor(rand() * 40);
  const baseWind = 1.5 + rand() * 6;
  const baseCondition = CONDITIONS[Math.floor(rand() * CONDITIONS.length)] ?? "clear";

  const todayStart = now - (now % 86400);
  const sunrise = todayStart + 5.5 * 3600 - tzOffset;
  const sunset = todayStart + 19 * 3600 - tzOffset;

  const current: CurrentWeather = {
    dt: now,
    temp: round1(baseTemp),
    feelsLike: round1(baseTemp - baseWind * 0.3),
    humidity: baseHumidity,
    windSpeed: round1(baseWind),
    windDeg: Math.floor(rand() * 360),
    windGust: round1(baseWind + 2 + rand() * 3),
    rain1h: baseCondition === "rain" ? round1(0.4 + rand()) : undefined,
    uvi: round1(rand() * 9),
    pressure: 1008 + Math.floor(rand() * 18),
    visibility: 10000,
    condition: baseCondition,
    description: DESCRIPTIONS[baseCondition],
    icon: ICONS[baseCondition],
    sunrise,
    sunset,
  };

  const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => {
    const dt = now + i * 3600;
    const hourLocal = new Date((dt + tzOffset) * 1000).getUTCHours();
    // Diurnal temperature curve peaking ~15:00.
    const diurnal = Math.cos(((hourLocal - 15) / 24) * 2 * Math.PI) * 5;
    const cond =
      rand() > 0.8 ? "rain" : rand() > 0.5 ? "clouds" : baseCondition;
    return {
      dt,
      temp: round1(baseTemp + diurnal + (rand() - 0.5) * 1.5),
      feelsLike: round1(baseTemp + diurnal - baseWind * 0.3),
      pop: round2(cond === "rain" ? 0.4 + rand() * 0.5 : rand() * 0.25),
      windSpeed: round1(Math.max(0.5, baseWind + (rand() - 0.5) * 3)),
      humidity: clampInt(baseHumidity + Math.floor((rand() - 0.5) * 20)),
      condition: cond,
      icon: hourLocal >= 6 && hourLocal < 19 ? ICONS[cond] : ICONS[cond].replace("d", "n"),
    };
  });

  const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
    const dt = todayStart + i * 86400 + 12 * 3600 - tzOffset;
    const cond = CONDITIONS[Math.floor(rand() * CONDITIONS.length)] ?? "clear";
    const dayTemp = baseTemp + (rand() - 0.5) * 6;
    return {
      dt,
      tempMin: round1(dayTemp - 5 - rand() * 2),
      tempMax: round1(dayTemp + 4 + rand() * 2),
      pop: round2(cond === "rain" ? 0.4 + rand() * 0.5 : rand() * 0.3),
      windSpeed: round1(Math.max(0.5, baseWind + (rand() - 0.5) * 3)),
      humidity: clampInt(baseHumidity + Math.floor((rand() - 0.5) * 20)),
      uvi: round1(rand() * 9),
      condition: cond,
      description: DESCRIPTIONS[cond],
      icon: ICONS[cond],
      sunrise: sunrise + i * 86400,
      sunset: sunset + i * 86400,
    };
  });

  return { timezoneOffset: tzOffset, current, hourly, daily, mocked: true };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function clampInt(n: number) {
  return Math.min(100, Math.max(0, Math.round(n)));
}
