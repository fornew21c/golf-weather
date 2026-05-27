"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Droplets } from "lucide-react";
import type { HourlyForecast } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHourLabel, formatTemp, owIconUrl } from "@/lib/utils";

// Lazy-load the Recharts bundle; show a skeleton while it streams in.
const HourlyChart = dynamic(() => import("./hourly-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[220px] w-full rounded-xl" />,
});

export function HourlyForecastCard({
  hourly,
  tzOffset,
}: {
  hourly: HourlyForecast[];
  tzOffset: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>시간별 예보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <HourlyChart hourly={hourly} tzOffset={tzOffset} />

        {/* Horizontally scrollable hour strip with per-hour rain probability. */}
        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
          {hourly.slice(0, 24).map((h) => (
            <div
              key={h.dt}
              className="flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-3 text-center transition-colors hover:bg-accent/60"
            >
              <span className="text-xs text-muted-foreground">
                {formatHourLabel(h.dt, tzOffset)}
              </span>
              <Image
                src={owIconUrl(h.icon)}
                alt=""
                width={36}
                height={36}
                unoptimized
              />
              <span className="text-sm font-semibold">{formatTemp(h.temp)}</span>
              <span className="flex items-center gap-0.5 text-xs text-sky-500">
                <Droplets className="size-3" />
                {Math.round(h.pop * 100)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
