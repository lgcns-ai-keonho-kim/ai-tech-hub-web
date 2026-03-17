/**
 * 목적: 브랜드 워드마크와 심볼 자산을 일관된 규칙으로 렌더링한다.
 * 설명: 헤더, 히어로, 상태 패널에서 같은 브랜드 시각 언어를 재사용할 수 있게 한다.
 * 적용 패턴: 프레젠테이션 컴포넌트 패턴
 * 참조: assets/logo/logo.png, assets/logo/farvicon.png, ui/src/widgets/global-header.tsx
 */
import { cn } from "@/shared/lib/cn";

import logoWordmark from "../../../../assets/logo/logo.png";
import logoSignal from "../../../../assets/logo/farvicon.png";

export function BrandMark({
  variant = "lockup",
  className,
  decorative = false,
}: {
  variant?: "lockup" | "wordmark" | "signal";
  className?: string;
  decorative?: boolean;
}) {
  const ariaHidden = decorative || undefined;
  const altText = decorative ? "" : "AI Agent Hub";

  if (variant === "signal") {
    return (
      <img
        src={logoSignal}
        alt={altText}
        aria-hidden={ariaHidden}
        className={cn("size-11 object-contain", className)}
      />
    );
  }

  if (variant === "wordmark") {
    return (
      <img
        src={logoWordmark}
        alt={altText}
        aria-hidden={ariaHidden}
        className={cn("block h-8 w-auto object-contain", className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={logoWordmark}
        alt={altText}
        aria-hidden={ariaHidden}
        className="block h-7 w-auto object-contain"
      />
    </div>
  );
}
