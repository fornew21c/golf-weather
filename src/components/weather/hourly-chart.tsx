"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HourlyForecast } from "@/lib/types";
import { formatHourLabel, formatPercent, formatTemp } from "@/lib/utils";

/**
 * Heavy Recharts area chart — imported via next/dynamic from the parent so
 * the ~100KB charting bundle is only loaded on the detail page.
 */
export default function HourlyChart({
  hourly,
  tzOffset,
}: {
  hourly: HourlyForecast[];
  tzOffset: number;
}) {
  const data = hourly.slice(0, 24).map((h) => ({
    time: formatHourLabel(h.dt, tzOffset),
    temp: Math.round(h.temp),
    pop: Math.round(h.pop * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          interval={2}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(v) => `${v}°`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--popover))",
            color: "hsl(var(--popover-foreground))",
            fontSize: 13,
          }}
          formatter={(value: number, name) =>
            name === "temp"
              ? [formatTemp(value), "기온"]
              : [formatPercent(value / 100), "강수확률"]
          }
        />
        <Area
          type="monotone"
          dataKey="temp"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          fill="url(#tempFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
