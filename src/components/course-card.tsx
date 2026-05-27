import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Flag, MapPin } from "lucide-react";
import type { GolfCourse } from "@/lib/types";
import { Card } from "@/components/ui/card";

/** Featured golf course tile linking to its weather detail page. */
export function CourseCard({ course }: { course: GolfCourse }) {
  return (
    <Link
      href={`/course/${course.id}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="relative h-56 overflow-hidden border-0 p-0">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-fairway-gradient" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-white/80">
            <MapPin className="size-3.5" />
            {course.region}
            {course.holes ? (
              <>
                <span className="opacity-50">·</span>
                <Flag className="size-3.5" />
                {course.holes}H
              </>
            ) : null}
          </div>
          <div className="flex items-end justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight">
              {course.name}
            </h3>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors group-hover:bg-white/30">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
