/**
 * 목적: 댓글 목록 UI를 공용 피처로 제공한다.
 * 설명: 자산 상세와 게시판 상세가 동일한 댓글 카드 패턴을 재사용하도록 구성한다.
 * 적용 패턴: 프레젠테이션 컴포넌트 패턴
 * 참조: ui/src/pages/asset-detail-page.tsx, ui/src/pages/board-detail-page.tsx
 */
import { formatDateTime } from "@/shared/lib/format";

type CommentItem = {
  id: number;
  userName: string;
  content: string;
  createdAt: string;
};

export function CommentList({ items }: { items: CommentItem[] }) {
  return (
    <>
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-foreground">{item.userName}</div>
            <div className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</div>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.content}</p>
        </div>
      ))}
    </>
  );
}
