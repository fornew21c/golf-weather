import type { MetadataRoute } from "next";
import { KOREAN_GOLF_COURSES } from "@/lib/courses";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...KOREAN_GOLF_COURSES.map((c) => ({
      url: `${siteUrl}/course/${c.id}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];
}
