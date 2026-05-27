"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="text-3xl font-bold">문제가 발생했어요</h1>
        <p className="mt-2 text-muted-foreground">
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
      <Button onClick={reset}>
        <RefreshCw className="size-4" />
        다시 시도
      </Button>
    </main>
  );
}
