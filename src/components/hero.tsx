import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/search-bar";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-fairway-gradient">
      <div className="absolute inset-0 bg-green-texture opacity-60" aria-hidden />
      <div className="container relative flex flex-col items-center py-16 text-center sm:py-24">
        <Badge variant="glass" className="mb-5 animate-fade-up">
          <Sparkles className="size-3.5" />
          한국 골프장 전용 날씨
        </Badge>

        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight animate-fade-up sm:text-6xl">
          완벽한 라운딩을 위한{" "}
          <span className="bg-gradient-to-br from-primary to-emerald-400 bg-clip-text text-transparent">
            골프 날씨
          </span>
        </h1>

        <p
          className="mt-5 max-w-xl text-balance text-base text-muted-foreground animate-fade-up sm:text-lg"
          style={{ animationDelay: "60ms" }}
        >
          골프장 이름만 검색하면 현재 날씨, 시간별 예보, 강수 확률, 골프 적합도
          점수와 복장 추천까지 한눈에.
        </p>

        <div
          className="mt-8 w-full max-w-xl animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          <SearchBar autoFocus />
        </div>
      </div>
    </section>
  );
}
