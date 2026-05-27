import {
  Droplets,
  Gauge,
  Sun,
  Sunrise,
  Sunset,
  Wind,
} from "lucide-react";
import type { CurrentWeather, WeatherBundle } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { formatTime, formatWind, windDirection } from "@/lib/utils";

function Metric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}

export function WeatherDetailGrid({
  current,
  tzOffset,
}: {
  current: CurrentWeather;
  tzOffset: WeatherBundle["timezoneOffset"];
}) {
  const uvLabel =
    current.uvi >= 8
      ? "매우 높음"
      : current.uvi >= 6
        ? "높음"
        : current.uvi >= 3
          ? "보통"
          : "낮음";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Metric
        icon={Wind}
        label="바람"
        value={formatWind(current.windSpeed)}
        sub={`${windDirection(current.windDeg)}${
          current.windGust ? ` · 돌풍 ${current.windGust.toFixed(0)}` : ""
        }`}
      />
      <Metric icon={Droplets} label="습도" value={`${current.humidity}%`} />
      <Metric
        icon={Sun}
        label="자외선"
        value={current.uvi.toFixed(0)}
        sub={uvLabel}
      />
      <Metric
        icon={Gauge}
        label="기압"
        value={`${current.pressure}`}
        sub="hPa"
      />
      <Metric
        icon={Sunrise}
        label="일출"
        value={formatTime(current.sunrise, tzOffset)}
      />
      <Metric
        icon={Sunset}
        label="일몰"
        value={formatTime(current.sunset, tzOffset)}
      />
    </div>
  );
}
