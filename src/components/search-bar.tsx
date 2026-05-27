"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCourseSearch } from "@/hooks/use-search";
import { getCourseById } from "@/lib/courses";
import type { GolfCourse } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Autocomplete search for Korean golf courses.
 * - Debounced queries (300ms) via useCourseSearch.
 * - Full keyboard navigation (↑ ↓ Enter Esc).
 * - Persists the selected course in sessionStorage so the detail page can
 *   render geocoded (non-curated) courses without another lookup.
 */
export function SearchBar({
  autoFocus,
  className,
}: {
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  // 드롭다운은 body로 포털 렌더링해 부모의 stacking context/overflow에서 벗어난다.
  const [mounted, setMounted] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 });
  React.useEffect(() => setMounted(true), []);

  const { data, isFetching } = useCourseSearch(query);
  const results = data?.results ?? [];

  // 입력창 위치를 측정해 드롭다운(fixed)의 좌표를 갱신.
  const updatePosition = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 8, left: r.left, width: r.width });
  }, []);

  // Close on outside click (포털된 드롭다운도 "내부"로 인정).
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (containerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function select(course: GolfCourse) {
    // Cache so /course/[id] can resolve geocoded results instantly.
    try {
      sessionStorage.setItem(`course:${course.id}`, JSON.stringify(course));
    } catch {
      /* storage may be unavailable */
    }
    setOpen(false);
    setQuery("");
    router.push(`/course/${course.id}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = results[activeIndex] ?? results[0];
      if (choice) select(choice);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length > 0;

  // 드롭다운이 열려 있는 동안 스크롤/리사이즈에 맞춰 위치 추적.
  React.useEffect(() => {
    if (!showDropdown) return;
    updatePosition();
    const handler = () => updatePosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [showDropdown, results.length, updatePosition]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="course-listbox"
          aria-autocomplete="list"
          autoFocus={autoFocus}
          placeholder="골프장 이름 검색 (예: 잭니클라우스, 사우스케이프)"
          className="h-14 rounded-2xl pl-12 pr-12 text-base shadow-soft"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {isFetching && (
          <Loader2
            className="absolute right-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden
          />
        )}
      </div>

      {mounted &&
        showDropdown &&
        createPortal(
          <ul
            ref={listRef}
            id="course-listbox"
            role="listbox"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 60,
            }}
            className="max-h-80 overflow-auto rounded-2xl border border-border bg-popover/95 p-2 shadow-glass backdrop-blur-xl"
          >
            {results.length === 0 && !isFetching && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                검색 결과가 없습니다. 다른 골프장 이름을 입력해 보세요.
              </li>
            )}
            {results.map((course, i) => (
              <li key={course.id} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => select(course)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    i === activeIndex ? "bg-accent" : "hover:bg-accent/60",
                  )}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {course.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {course.address}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}

/** Helper used by the detail page to read a cached geocoded course. */
export function readCachedCourse(id: string): GolfCourse | undefined {
  const curated = getCourseById(id);
  if (curated) return curated;
  try {
    const raw = sessionStorage.getItem(`course:${id}`);
    return raw ? (JSON.parse(raw) as GolfCourse) : undefined;
  } catch {
    return undefined;
  }
}
