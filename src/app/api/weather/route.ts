import { NextResponse } from "next/server";
import { getWeather } from "@/lib/weather-api";

export const runtime = "nodejs";

/**
 * GET /api/weather?lat=37.3&lon=126.6
 * Returns a normalized WeatherBundle (mocked when no API key is set).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "lat and lon query params are required" },
      { status: 400 },
    );
  }

  const data = await getWeather(lat, lon);

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
    },
  });
}
