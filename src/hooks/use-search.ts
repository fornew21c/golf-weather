"use client";

import { useQuery } from "@tanstack/react-query";
import type { GolfCourse } from "@/lib/types";
import { useDebounce } from "./use-debounce";

interface SearchResponse {
  results: GolfCourse[];
  source: string;
}

async function fetchSearch(query: string): Promise<SearchResponse> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

/**
 * Debounced autocomplete search hook (Korea-only courses).
 * Skips the network entirely for queries shorter than 1 char.
 */
export function useCourseSearch(rawQuery: string) {
  const query = useDebounce(rawQuery.trim(), 300);

  return useQuery({
    queryKey: ["course-search", query],
    queryFn: () => fetchSearch(query),
    enabled: query.length >= 1,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });
}
