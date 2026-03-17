/**
 * 목적: 페이지 단위 로딩 오버레이를 렌더링한다.
 * 설명: 데이터 초기 로딩 중 화면 중앙에 스피너와 짧은 안내 문구를 오버레이로 보여준다.
 * 적용 패턴: 오버레이 상태 패턴
 * 참조: ui/src/components/ui/spinner.tsx
 */
import { Spinner } from "@/shared/ui/primitives/spinner";

export function PageLoadingOverlay({
  message = "불러오는 중입니다.",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/58 ">
      <div className="surface-panel-muted flex min-w-[220px] flex-col items-center gap-4 rounded-lg border border-border px-8 py-7">
        <Spinner />
        <div className="text-sm font-medium text-foreground">{message}</div>
      </div>
    </div>
  );
}
