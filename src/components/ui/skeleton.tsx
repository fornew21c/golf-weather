import { cn } from "@/lib/utils";

/** Shimmering placeholder block used by loading states. */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/70",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
