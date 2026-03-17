/**
 * 목적: 주요 페이지의 상단 히어로 패널을 공통 구조로 제공한다.
 * 설명: 페이지 제목, 설명, 액션, 보조 패널을 일관된 비주얼 규칙으로 조합한다.
 * 적용 패턴: 컴포지션 패턴
 * 참조: ui/src/pages/home-page.tsx, ui/src/pages/lessons-page.tsx, ui/src/pages/admin-dashboard-page.tsx
 */
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export function SectionHero({
  eyebrow,
  title,
  meta,
  description,
  actions,
  aside,
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: ReactNode;
  meta?: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <section
      className={cn(
        "hero-panel grid gap-4",
        aside && "xl:grid-cols-[minmax(0,1.25fr)_360px]",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {eyebrow ? <span className="section-title">{eyebrow}</span> : null}
          <div className="flex flex-col gap-2">
            <h1 className={cn("text-2xl font-medium text-foreground", titleClassName)}>
              {title}
            </h1>
            {meta ? <div className="flex flex-wrap gap-2.5">{meta}</div> : null}
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
      </div>
      {aside ? <div className="flex h-full flex-col justify-between">{aside}</div> : null}
    </section>
  );
}
