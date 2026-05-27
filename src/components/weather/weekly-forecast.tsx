import Image from "next/image";
import { Droplets, Wind } from "lucide-react";
import type { DailyForecast } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTemp, formatWeekday, owIconUrl } from "@/lib/utils";

export function WeeklyForecastCard({
  daily,
  tzOffset,
}: {
  daily: DailyForecast[];
  tzOffset: number;
}) {
  // Temperature range across the week for the relative range bars.
  const min = Math.min(...daily.map((d) => d.tempMin));
  const max = Math.max(...daily.map((d) => d.tempMax));
  const span = Math.max(1, max - min);

  return (
    <Card>
      <CardHeader>
        <CardTitle>주간 예보</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {daily.map((d, i) => {
            const left = ((d.tempMin - min) / span) * 100;
            const width = ((d.tempMax - d.tempMin) / span) * 100;
            return (
              <li
                key={d.dt}
                className="grid grid-cols-[3rem_2.5rem_1fr_auto] items-center gap-3 py-3"
              >
                <span className="text-sm font-medium">
                  {i === 0 ? "오늘" : formatWeekday(d.dt, tzOffset)}
                </span>
                <Image
                  src={owIconUrl(d.icon)}
                  alt={d.description}
                  width={32}
                  height={32}
                  unoptimized
                />
                <div className="flex items-center gap-2">
                  <span className="w-8 text-right text-sm text-muted-foreground tabular-nums">
                    {formatTemp(d.tempMin)}
                  </span>
                  <div className="relative h-1.5 flex-1 rounded-full bg-muted">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm font-medium tabular-nums">
                    {formatTemp(d.tempMax)}
                  </span>
                </div>
                <div className="flex w-20 justify-end gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5 text-sky-500">
                    <Droplets className="size-3" />
                    {Math.round(d.pop * 100)}%
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Wind className="size-3" />
                    {d.windSpeed.toFixed(0)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
