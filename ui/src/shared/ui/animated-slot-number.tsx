/**
 * 목적: 숫자 지표에 짧은 슬롯머신 느낌의 카운트 애니메이션을 적용한다.
 * 설명: 화면 표시 시점에 맞춰 700ms 동안 0 또는 이전 값에서 목표 값으로 부드럽게 변화한다.
 * 적용 패턴: 표시 애니메이션 패턴
 * 참조: ui/src/pages/home-page.tsx, ui/src/index.css
 */
import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";

export function AnimatedSlotNumber({
  value,
  format,
  className,
  durationMs = 700,
  startWhenVisible = false,
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
  durationMs?: number;
  startWhenVisible?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(!startWhenVisible);
  const previousValueRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!startWhenVisible || hasEnteredView || typeof IntersectionObserver === "undefined") {
      return;
    }

    const node = rootRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setHasEnteredView(true);
        observer.disconnect();
      },
      {
        threshold: 0.35,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasEnteredView, startWhenVisible]);

  useEffect(() => {
    if (!hasEnteredView) {
      return;
    }

    const from = previousValueRef.current;
    const to = value;

    if (from === to) {
      setDisplayValue(to);
      return;
    }

    setIsAnimating(true);

    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = from + (to - from) * easedProgress;

      setDisplayValue(Math.round(nextValue));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      previousValueRef.current = to;
      setDisplayValue(to);
      setIsAnimating(false);
      frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [durationMs, hasEnteredView, value]);

  return (
    <span ref={rootRef} className="metric-slot-shell">
      <span className={cn("metric-slot-value", isAnimating && "metric-slot-value-anim", className)}>
        {format(displayValue)}
      </span>
    </span>
  );
}
