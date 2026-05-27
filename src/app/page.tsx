import { Cloud, Gauge, Shirt } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { FeaturedCourses } from "@/components/featured-courses";

const HIGHLIGHTS = [
  {
    icon: Cloud,
    title: "정밀 예보",
    desc: "현재 날씨부터 24시간·7일 예보, 강수 확률과 바람까지.",
  },
  {
    icon: Gauge,
    title: "골프 적합도 점수",
    desc: "비·바람·기온·습도를 종합한 0–100 플레이 컨디션 점수.",
  },
  {
    icon: Shirt,
    title: "복장 추천",
    desc: "체감 날씨에 맞춘 의류와 우산·우비 추천.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <SiteHeader />
      <Hero />

      <section className="container py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card/60 p-6 shadow-soft backdrop-blur-sm"
            >
              <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <FeaturedCourses />

      <footer className="border-t border-border/60 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          Golf Weather · 한국 골프장 전용 날씨 서비스 · 데이터: OpenWeather
        </div>
      </footer>
    </main>
  );
}
