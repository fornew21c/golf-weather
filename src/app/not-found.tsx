import Link from "next/link";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Flag className="size-8" />
      </span>
      <div>
        <h1 className="text-3xl font-bold">페이지를 찾을 수 없어요</h1>
        <p className="mt-2 text-muted-foreground">
          요청하신 페이지가 존재하지 않습니다.
        </p>
      </div>
      <Button asChild>
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </main>
  );
}
