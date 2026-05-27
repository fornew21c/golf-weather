import type {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  WeatherBundle,
  WeatherCondition,
} from "./types";
import { buildMockWeather } from "./mock-data";

/**
 * OpenWeather "One Call API 3.0" client with graceful mock fallback.
 * Server-side only — keeps the API key out of the browser.
 */

function mapCondition(main: string): WeatherCondition {
  const m = main.toLowerCase();
  if (m.includes("thunder")) return "thunderstorm";
  if (m.includes("drizzle")) return "drizzle";
  if (m.includes("rain")) return "rain";
  if (m.includes("snow")) return "snow";
  if (m.includes("cloud")) return "clouds";
  if (m.includes("clear")) return "clear";
  if (m.includes("fog")) return "fog";
  if (m.includes("mist") || m.includes("haze") || m.includes("smoke")) return "mist";
  return "clouds";
}

interface OWWeather {
  main: string;
  description: string;
  icon: string;
}

interface OneCallResponse {
  timezone_offset: number;
  current: {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust?: number;
    rain?: { "1h"?: number };
    uvi: number;
    pressure: number;
    visibility: number;
    sunrise: number;
    sunset: number;
    weather: OWWeather[];
  };
  hourly: {
    dt: number;
    temp: number;
    feels_like: number;
    pop: number;
    wind_speed: number;
    humidity: number;
    weather: OWWeather[];
  }[];
  daily: {
    dt: number;
    temp: { min: number; max: number };
    pop: number;
    wind_speed: number;
    humidity: number;
    uvi: number;
    sunrise: number;
    sunset: number;
    weather: OWWeather[];
  }[];
}

function normalize(data: OneCallResponse): WeatherBundle {
  const cw = data.current;
  const w0 = cw.weather[0] ?? { main: "Clouds", description: "clouds", icon: "03d" };

  const current: CurrentWeather = {
    dt: cw.dt,
    temp: cw.temp,
    feelsLike: cw.feels_like,
    humidity: cw.humidity,
    windSpeed: cw.wind_speed,
    windDeg: cw.wind_deg,
    windGust: cw.wind_gust,
    rain1h: cw.rain?.["1h"],
    uvi: cw.uvi,
    pressure: cw.pressure,
    visibility: cw.visibility,
    condition: mapCondition(w0.main),
    description: w0.description,
    icon: w0.icon,
    sunrise: cw.sunrise,
    sunset: cw.sunset,
  };

  const hourly: HourlyForecast[] = data.hourly.slice(0, 24).map((h) => {
    const w = h.weather[0] ?? w0;
    return {
      dt: h.dt,
      temp: h.temp,
      feelsLike: h.feels_like,
      pop: h.pop,
      windSpeed: h.wind_speed,
      humidity: h.humidity,
      condition: mapCondition(w.main),
      icon: w.icon,
    };
  });

  const daily: DailyForecast[] = data.daily.slice(0, 7).map((d) => {
    const w = d.weather[0] ?? w0;
    return {
      dt: d.dt,
      tempMin: d.temp.min,
      tempMax: d.temp.max,
      pop: d.pop,
      windSpeed: d.wind_speed,
      humidity: d.humidity,
      uvi: d.uvi,
      condition: mapCondition(w.main),
      description: w.description,
      icon: w.icon,
      sunrise: d.sunrise,
      sunset: d.sunset,
    };
  });

  return {
    timezoneOffset: data.timezone_offset,
    current,
    hourly,
    daily,
    mocked: false,
  };
}

/**
 * Fetch normalized weather for a coordinate. Falls back to deterministic
 * mock data when no API key is set or the upstream request fails.
 */
export async function getWeather(lat: number, lon: number): Promise<WeatherBundle> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return buildMockWeather(lat, lon);

  const url = new URL("https://api.openweathermap.org/data/3.0/onecall");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("units", "metric");
  url.searchParams.set("exclude", "minutely,alerts");
  url.searchParams.set("appid", key);

  try {
    const res = await fetch(url, {
      // Cache upstream weather for 10 minutes to limit API spend.
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      // Likely missing One Call 3.0 subscription — degrade gracefully.
      return buildMockWeather(lat, lon);
    }
    const data = (await res.json()) as OneCallResponse;
    return normalize(data);
  } catch {
    return buildMockWeather(lat, lon);
  }
}
