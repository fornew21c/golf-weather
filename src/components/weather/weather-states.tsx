import Link from "next/link";
import { CloudOff, MapPinOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Full loading skeleton mirroring the detail layout. */
export function WeatherSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center justify-between gap-6 pt-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-16 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="size-24 rounded-full" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}

export function WeatherError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <CloudOff className="size-7" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">날씨를 불러오지 못했어요</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시 후 다시 시도해 주세요.
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="size-4" />
            다시 시도
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function CourseNotFound() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <MapPinOff className="size-7" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">골프장을 찾을 수 없어요</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            검색을 통해 다시 골프장을 선택해 주세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
