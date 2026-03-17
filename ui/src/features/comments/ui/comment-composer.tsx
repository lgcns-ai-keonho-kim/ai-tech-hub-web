/**
 * 목적: 댓글 작성 UI를 공용 피처로 제공한다.
 * 설명: 작성 가능 여부 안내, 입력, 등록 버튼 패턴을 자산/게시판 상세에서 함께 재사용한다.
 * 적용 패턴: 제어 컴포넌트 패턴
 * 참조: ui/src/pages/asset-detail-page.tsx, ui/src/pages/board-detail-page.tsx
 */
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/ui/primitives/alert";
import { Button } from "@/shared/ui/primitives/button";
import { Textarea } from "@/shared/ui/primitives/textarea";

type CommentComposerProps = {
  canSubmit: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  isPending: boolean;
  title?: string;
  placeholder?: string;
  blockedTitle?: string;
  blockedDescription?: string;
};

export function CommentComposer({
  canSubmit,
  value,
  onChange,
  onSubmit,
  isPending,
  title = "댓글 등록",
  placeholder = "프로젝트에 도움이 되는 맥락을 남겨 주세요.",
  blockedTitle,
  blockedDescription,
}: CommentComposerProps) {
  return (
    <div className="space-y-4">
      {!canSubmit && blockedTitle && blockedDescription ? (
        <Alert className="border-border bg-muted/50">
          <AlertTitle>{blockedTitle}</AlertTitle>
          <AlertDescription>{blockedDescription}</AlertDescription>
        </Alert>
      ) : null}
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-36 rounded-lg border-border bg-background"
      />
      <Button
        type="button"
        className="w-full rounded-md"
        disabled={!canSubmit || value.trim().length < 2 || isPending}
        onClick={() => void onSubmit()}
      >
        {isPending ? "등록 중..." : title}
      </Button>
    </div>
  );
}
