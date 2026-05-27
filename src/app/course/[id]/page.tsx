import type { Metadata } from "next";
import { getCourseById, KOREAN_GOLF_COURSES } from "@/lib/courses";
import { CourseDetail } from "@/components/weather/course-detail";

interface PageProps {
  params: { id: string };
}

/** Pre-render curated courses at build time for instant loads + SEO. */
export function generateStaticParams() {
  return KOREAN_GOLF_COURSES.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const course = getCourseById(params.id);
  if (!course) {
    return {
      title: "골프장 날씨",
      description: "한국 골프장의 날씨와 골프 적합도 점수를 확인하세요.",
    };
  }
  const title = `${course.name} 날씨`;
  const description = `${course.name}(${course.region})의 현재 날씨, 시간별·주간 예보, 골프 적합도 점수와 복장 추천.`;
  return {
    title,
    description,
    alternates: { canonical: `/course/${course.id}` },
    openGraph: {
      title,
      description,
      images: course.image ? [{ url: course.image }] : undefined,
    },
  };
}

export default function CoursePage({ params }: PageProps) {
  const initialCourse = getCourseById(params.id);
  return <CourseDetail id={params.id} initialCourse={initialCourse} />;
}
