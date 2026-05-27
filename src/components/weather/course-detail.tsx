"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SearchBar, readCachedCourse } from "@/components/search-bar";
import { useWeather } from "@/hooks/use-weather";
import type { GolfCourse } from "@/lib/types";
import { computeGolfScore } from "@/lib/golf-score";
import { generateGolfSummary } from "@/lib/summary";
import { recommendClothing } from "@/lib/clothing";

import { CurrentWeatherCard } from "./current-weather";
import { WeatherDetailGrid } from "./weather-detail-grid";
import { GolfScoreCard } from "./golf-score-card";
import { AiSummaryCard } from "./ai-summary";
import { ClothingCard } from "./clothing-card";
import { HourlyForecastCard } from "./hourly-forecast";
import { WeeklyForecastCard } from "./weekly-forecast";
import {
  CourseNotFound,
  WeatherError,
  WeatherSkeleton,
} from "./weather-states";

export function CourseDetail({
  id,
  initialCourse,
}: {
  id: string;
  /** Provided when the course exists in the curated list (SSR-friendly). */
  initialCourse?: GolfCourse;
}) {
  // Resolve geocoded courses from the sessionStorage cache on the client.
  const [course, setCourse] = React.useState<GolfCourse | undefined>(
    initialCourse,
  );
  const [resolved, setResolved] = React.useState(Boolean(initialCourse));

  React.useEffect(() => {
    if (!initialCourse) {
      setCourse(readCachedCourse(id));
      setResolved(true);
    }
  }, [id, initialCourse]);

  const { data, isLoading, isError, refetch } = useWeather(
    course?.lat,
    course?.lon,
  );

  return (
    <main className="min-h-dvh">
      <SiteHeader />

      {/* Sticky mobile search bar. */}
      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/80 py-3 backdrop-blur-xl lg:relative lg:top-0 lg:border-0 lg:bg-transparent">
        <div className="container">
          <SearchBar />
        </div>
      </div>

      <div className="container space-y-6 py-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/">
            <ArrowLeft className="size-4" />
            홈으로
          </Link>
        </Button>

        {!course && resolved ? (
          <CourseNotFound />
        ) : (
          <>
            <header className="animate-fade-up">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {course?.name ?? "골프장"}
              </h1>
            </header>

            {isLoading || !course ? (
              <WeatherSkeleton />
            ) : isError || !data ? (
              <WeatherError onRetry={() => refetch()} />
            ) : (
              <ResolvedWeather course={course} bundle={data} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

function ResolvedWeather({
  course,
  bundle,
}: {
  course: GolfCourse;
  bundle: NonNullable<ReturnType<typeof useWeather>["data"]>;
}) {
  const { current, hourly, daily, timezoneOffset, mocked } = bundle;

  // Derive all rule-based insights (memoized — pure functions of the data).
  const score = React.useMemo(
    () =>
      computeGolfScore({
        pop: hourly[0]?.pop ?? 0,
        windSpeed: current.windSpeed,
        temp: current.temp,
        humidity: current.humidity,
      }),
    [hourly, current],
  );

  const summary = React.useMemo(
    () => generateGolfSummary({ current, hourly, score }),
    [current, hourly, score],
  );

  const clothing = React.useMemo(
    () => recommendClothing(current, hourly),
    [current, hourly],
  );

  return (
    <div className="space-y-6">
      <CurrentWeatherCard course={course} current={current} mocked={mocked} />
      <WeatherDetailGrid current={current} tzOffset={timezoneOffset} />
      <AiSummaryCard summary={summary} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GolfScoreCard score={score} />
        </div>
        <ClothingCard rec={clothing} />
      </div>

      <HourlyForecastCard hourly={hourly} tzOffset={timezoneOffset} />
      <WeeklyForecastCard daily={daily} tzOffset={timezoneOffset} />
    </div>
  );
}
