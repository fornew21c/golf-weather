/**
 * Shared domain types for Golf Weather.
 * These normalized shapes decouple the UI from any specific weather/geocode
 * provider, so swapping OpenWeather, Kakao, or Google never touches components.
 */

export interface GolfCourse {
  /** Stable slug-style id used in routes: /course/[id] */
  id: string;
  name: string;
  /** Optional English/romanized name for SEO + accessibility. */
  nameEn?: string;
  address: string;
  region: string;
  lat: number;
  lon: number;
  /** Number of holes, when known. */
  holes?: number;
  /** Marketing image (Unsplash etc.). */
  image?: string;
}

export type WeatherCondition =
  | "clear"
  | "clouds"
  | "rain"
  | "drizzle"
  | "thunderstorm"
  | "snow"
  | "mist"
  | "fog";

export interface CurrentWeather {
  /** Unix seconds. */
  dt: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  windGust?: number;
  /** 0–1 probability not provided for "current"; precip volume in mm. */
  rain1h?: number;
  uvi: number;
  pressure: number;
  visibility: number;
  condition: WeatherCondition;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feelsLike: number;
  /** Probability of precipitation, 0–1. */
  pop: number;
  windSpeed: number;
  humidity: number;
  condition: WeatherCondition;
  icon: string;
}

export interface DailyForecast {
  dt: number;
  tempMin: number;
  tempMax: number;
  /** Probability of precipitation, 0–1. */
  pop: number;
  windSpeed: number;
  humidity: number;
  uvi: number;
  condition: WeatherCondition;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
}

export interface WeatherBundle {
  timezoneOffset: number;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  /** True when served from local mock data (no API key configured). */
  mocked: boolean;
}

export type GolfRating = "Excellent" | "Good" | "Playable" | "Tough Conditions";

export interface GolfScore {
  /** 0–100 */
  value: number;
  rating: GolfRating;
  emoji: string;
  /** tailwind-friendly token used by the UI for the color indicator. */
  tone: "emerald" | "lime" | "amber" | "rose";
  /** Per-factor breakdown for transparency. */
  breakdown: {
    label: string;
    /** 0–100 contribution score (higher = better). */
    score: number;
  }[];
}

export interface ClothingRecommendation {
  /** Short headline, e.g. "Light layers". */
  title: string;
  items: { icon: string; label: string }[];
  /** Whether to carry an umbrella. */
  umbrella: boolean;
}
