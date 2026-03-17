/**
 * 목적: 숫자 중심의 메트릭 칩을 공통 스타일로 렌더링한다.
 * 설명: 카드, 상세, 대시보드에서 같은 깊이와 정보 계층을 공유하게 한다.
 * 적용 패턴: 프레젠테이션 컴포넌트 패턴
 * 참조: ui/src/widgets/agent-card.tsx, ui/src/pages/agent-detail-page.tsx
 */
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export function MetricChip({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("metric-chip surface-panel", className)}>
      <div className="text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-lg font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}
