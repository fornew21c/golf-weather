import Image from "next/image";
import type { CurrentWeather, GolfCourse } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTemp, owIconUrl } from "@/lib/utils";

export function CurrentWeatherCard({
  course,
  current,
  mocked,
}: {
  course: GolfCourse;
  current: CurrentWeather;
  mocked: boolean;
}) {
  return (
    <Card glass className="overflow-hidden">
      <CardContent className="relative flex flex-col gap-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="glass">{course.region}</Badge>
            {mocked && (
              <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
                샘플 데이터
              </Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{course.address}</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-6xl font-bold tracking-tighter sm:text-7xl">
              {formatTemp(current.temp)}
            </span>
            <span className="mb-2 text-sm text-muted-foreground">
              체감 {formatTemp(current.feelsLike)}
            </span>
          </div>
          <p className="mt-1 capitalize text-muted-foreground">
            {current.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-center">
          <Image
            src={owIconUrl(current.icon)}
            alt={current.description}
            width={140}
            height={140}
            className="drop-shadow-xl"
            unoptimized
            priority
          />
        </div>
      </CardContent>
    </Card>
  );
}
