import type { GolfRating, GolfScore } from "./types";
import { clamp } from "./utils";

/**
 * Rule-based golf playability score (0–100).
 *
 * Four weighted factors, each scored 0–100 (higher = better golf), then
 * combined by weight. No external AI — fully deterministic and explainable.
 */
interface ScoreInputs {
  /** Probability of precipitation, 0–1. */
  pop: number;
  /** Wind speed in m/s. */
  windSpeed: number;
  /** Temperature in °C. */
  temp: number;
  /** Relative humidity, 0–100. */
  humidity: number;
}

const WEIGHTS = { rain: 0.35, wind: 0.3, temp: 0.2, humidity: 0.15 };

/** Rain: 0% pop → 100, ramps down to 0 around 90% pop. */
function rainScore(pop: number): number {
  return clamp(100 - pop * 110);
}

/** Wind: calm ≤2 m/s ideal; degrades, ~10 m/s is very tough. */
function windScore(windSpeed: number): number {
  if (windSpeed <= 2) return 100;
  return clamp(100 - (windSpeed - 2) * 12);
}

/** Temp: ideal band 16–24°C; penalize deviation in both directions. */
function tempScore(temp: number): number {
  const ideal = 20;
  const deviation = Math.abs(temp - ideal);
  // gentle within ±4°C, steeper beyond
  const penalty = deviation <= 4 ? deviation * 3 : 12 + (deviation - 4) * 5;
  return clamp(100 - penalty);
}

/** Humidity: comfortable ≤55%; sticky above. */
function humidityScore(humidity: number): number {
  if (humidity <= 55) return 100;
  return clamp(100 - (humidity - 55) * 1.6);
}

function ratingFor(value: number): {
  rating: GolfRating;
  emoji: string;
  tone: GolfScore["tone"];
} {
  if (value >= 90) return { rating: "Excellent", emoji: "⛳️", tone: "emerald" };
  if (value >= 70) return { rating: "Good", emoji: "🙂", tone: "lime" };
  if (value >= 50) return { rating: "Playable", emoji: "😐", tone: "amber" };
  return { rating: "Tough Conditions", emoji: "🌬️", tone: "rose" };
}

export function computeGolfScore(inputs: ScoreInputs): GolfScore {
  const rain = rainScore(inputs.pop);
  const wind = windScore(inputs.windSpeed);
  const temp = tempScore(inputs.temp);
  const humidity = humidityScore(inputs.humidity);

  const value = Math.round(
    rain * WEIGHTS.rain +
      wind * WEIGHTS.wind +
      temp * WEIGHTS.temp +
      humidity * WEIGHTS.humidity,
  );

  const { rating, emoji, tone } = ratingFor(value);

  return {
    value,
    rating,
    emoji,
    tone,
    breakdown: [
      { label: "Rain", score: Math.round(rain) },
      { label: "Wind", score: Math.round(wind) },
      { label: "Temp", score: Math.round(temp) },
      { label: "Humidity", score: Math.round(humidity) },
    ],
  };
}
