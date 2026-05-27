import { CourseCard } from "@/components/course-card";
import { FEATURED_COURSE_IDS, getCourseById } from "@/lib/courses";

export function FeaturedCourses() {
  const courses = FEATURED_COURSE_IDS.map(getCourseById).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );

  return (
    <section className="container py-12 sm:py-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            인기 골프장
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            대표 골프장의 날씨를 바로 확인해 보세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
