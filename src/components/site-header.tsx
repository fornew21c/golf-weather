import Link from "next/link";
import { Flag } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Flag className="size-5" />
          </span>
          <span className="text-lg tracking-tight">
            Golf<span className="text-primary">Weather</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
