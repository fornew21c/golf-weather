import type { GolfScore } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const toneText: Record<GolfScore["tone"], string> = {
  emerald: "text-emerald-500",
  lime: "text-lime-500",
  amber: "text-amber-500",
  rose: "text-rose-500",
};

export function GolfScoreCard({ score }: { score: GolfScore }) {
  return (
    <Card glass>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>골프 적합도</span>
          <span className="text-2xl" aria-hidden>
            {score.emoji}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end gap-2">
          <span
            className={`text-5xl font-bold tabular-nums ${toneText[score.tone]}`}
          >
            {score.value}
          </span>
          <span className="mb-1.5 text-sm text-muted-foreground">/ 100</span>
          <span className={`mb-1 ml-auto font-semibold ${toneText[score.tone]}`}>
            {score.rating}
          </span>
        </div>

        <Progress value={score.value} tone={score.tone} />

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
          {score.breakdown.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <dt className="text-muted-foreground">{b.label}</dt>
                <dd className="font-medium tabular-nums">{b.score}</dd>
              </div>
              <Progress
                value={b.score}
                className="h-1.5"
                tone={
                  b.score >= 70 ? "emerald" : b.score >= 50 ? "amber" : "rose"
                }
                aria-label={`${b.label} score`}
              />
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
