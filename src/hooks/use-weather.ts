"use client";

import { useQuery } from "@tanstack/react-query";
import type { WeatherBundle } from "@/lib/types";

async function fetchWeather(lat: number, lon: number): Promise<WeatherBundle> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Failed to load weather");
  return res.json();
}

/**
 * Weather data hook with client-side caching (10 min) to complement the
 * server-side fetch cache. Disabled until valid coordinates are provided.
 */
export function useWeather(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ["weather", lat, lon],
    queryFn: () => fetchWeather(lat!, lon!),
    enabled: typeof lat === "number" && typeof lon === "number",
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}
