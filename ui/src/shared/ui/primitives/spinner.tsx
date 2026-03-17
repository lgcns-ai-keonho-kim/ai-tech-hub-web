/**
 * 목적: 공통 로딩 스피너를 렌더링한다.
 * 설명: shadcn 스타일 토큰을 따르는 회전형 인디케이터를 제공한다.
 * 적용 패턴: 프리미티브 컴포넌트 패턴
 * 참조: ui/src/shared/ui/page-loading-overlay.tsx
 */
import * as React from "react";

import { cn } from "@/shared/lib/cn";

function Spinner({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-slot="spinner"
      className={cn(
        "size-6 animate-spin rounded-full border-2 border-muted border-t-primary",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
