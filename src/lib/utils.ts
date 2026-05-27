import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WeatherCondition } from "./types";

/** Tailwind-aware className combiner used by every UI primitive. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Round to whole degrees and append the unit. */
export function formatTemp(value: number): string {
  return `${Math.round(value)}°`;
}

/** m/s with one decimal; metric is the Korean convention. */
export function formatWind(ms: number): string {
  return `${ms.toFixed(1)} m/s`;
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}

/** Format a unix timestamp (seconds) honoring the location timezone offset. */
export function formatTime(
  unixSeconds: number,
  timezoneOffsetSeconds: number,
  opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" },
): string {
  const ms = (unixSeconds + timezoneOffsetSeconds) * 1000;
  return new Intl.DateTimeFormat("en-US", {
    ...opts,
    timeZone: "UTC",
  }).format(new Date(ms));
}

export function formatHourLabel(unixSeconds: number, tzOffset: number): string {
  return formatTime(unixSeconds, tzOffset, { hour: "numeric" });
}

export function formatWeekday(unixSeconds: number, tzOffset: number): string {
  return formatTime(unixSeconds, tzOffset, { weekday: "short" });
}

/** Convert wind degrees to an 8-point compass label. */
export function windDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8] ?? "N";
}

const conditionEmoji: Record<WeatherCondition, string> = {
  clear: "☀️",
  clouds: "⛅️",
  rain: "🌧️",
  drizzle: "🌦️",
  thunderstorm: "⛈️",
  snow: "🌨️",
  mist: "🌫️",
  fog: "🌫️",
};

export function conditionToEmoji(c: WeatherCondition): string {
  return conditionEmoji[c] ?? "🌤️";
}

/** OpenWeather icon code → CDN url. */
export function owIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

/** Clamp helper. */
export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}
