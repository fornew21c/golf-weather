import {
  CloudRain,
  Glasses,
  Hand,
  Layers,
  Shirt,
  Sun,
  ThermometerSnowflake,
  Umbrella,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { ClothingRecommendation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Map our string icon keys to Lucide components (keeps lib UI-agnostic). */
const ICONS: Record<string, LucideIcon> = {
  shirt: Shirt,
  glasses: Glasses,
  layers: Layers,
  wind: Wind,
  "thermometer-snowflake": ThermometerSnowflake,
  hand: Hand,
  "cloud-rain": CloudRain,
  umbrella: Umbrella,
  sun: Sun,
};

export function ClothingCard({ rec }: { rec: ClothingRecommendation }) {
  return (
    <Card glass>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>복장 추천</span>
          <span className="text-sm font-normal text-muted-foreground">
            {rec.title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-2 gap-2.5">
          {rec.items.map((item) => {
            const Icon = ICONS[item.icon] ?? Shirt;
            return (
              <li
                key={item.label}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-background/50 px-3 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-medium leading-tight">
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
        {rec.umbrella && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
            <Umbrella className="size-4" />
            우산을 챙기는 것을 추천해요.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
