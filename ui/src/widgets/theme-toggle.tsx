/**
 * 목적: 라이트/다크 테마를 전환하는 공통 버튼을 제공한다.
 * 설명: next-themes 상태를 직접 제어해 헤더와 로그인 화면에서 같은 토글 경험을 재사용한다.
 * 적용 패턴: 프레젠테이션 컴포넌트 패턴
 * 참조: ui/src/app/providers.tsx, ui/src/widgets/app-shell-header.tsx
 */
"use client";

import Moon from "lucide-react/dist/esm/icons/moon";
import Sun from "lucide-react/dist/esm/icons/sun";
import { useTheme } from "next-themes";

import { Button } from "@/shared/ui/primitives/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={className}
      aria-label={isDark ? "라이트 테마로 전환" : "다크 테마로 전환"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Moon strokeWidth={1.5} /> : <Sun strokeWidth={1.5} />}
      <span className="sr-only">
        {isDark ? "라이트 테마로 전환" : "다크 테마로 전환"}
      </span>
    </Button>
  );
}
