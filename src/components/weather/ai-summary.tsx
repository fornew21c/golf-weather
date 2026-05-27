import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** Renders the locally-generated, rule-based golf summary. */
export function AiSummaryCard({ summary }: { summary: string }) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex gap-4 pt-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            오늘의 라운딩 요약
          </p>
          <p className="mt-1 text-base leading-relaxed text-foreground">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
