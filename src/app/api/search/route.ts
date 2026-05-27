import { NextResponse } from "next/server";
import { searchCourses } from "@/lib/geocode";

export const runtime = "nodejs";

/**
 * GET /api/search?q=잭니클라우스
 * Returns Korea-only golf course matches for autocomplete.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) {
    return NextResponse.json({ results: [], source: "local" });
  }

  const data = await searchCourses(q);

  return NextResponse.json(data, {
    headers: {
      // Cache autocomplete responses at the edge for a few minutes.
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
