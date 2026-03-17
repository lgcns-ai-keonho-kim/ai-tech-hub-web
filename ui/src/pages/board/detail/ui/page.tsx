/**
 * 목적: 게시글 상세와 댓글 영역을 렌더링한다.
 * 설명: 공지사항은 읽기 전용, Q&A는 댓글 작성 가능하도록 분기한다.
 * 적용 패턴: 상세 화면 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/shared/lib/markdown.tsx
 */
import { useState } from "react";
import { useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import {
  useCreateBoardCommentMutation,
} from "@/features/board-actions/model/mutations";
import { CommentComposer } from "@/features/comments/ui/comment-composer";
import { CommentList } from "@/features/comments/ui/comment-list";
import { getBoardTypeLabel } from "@/entities/asset/lib/labels";
import { useBoardCommentsQuery, useBoardPostDetailQuery } from "@/entities/board/model/queries";
import { formatDateTime } from "@/shared/lib/format";
import { MarkdownRenderer } from "@/shared/lib/markdown";
import { PageLoadingOverlay } from "@/shared/ui/page-loading-overlay";
import { SectionHero } from "@/shared/ui/section-hero";
import { useAuthStore } from "@/entities/session/model/store";

export function BoardDetailPage() {
  const params = useParams();
  const postId = Number(params.postId);
  const postQuery = useBoardPostDetailQuery(Number.isFinite(postId) ? postId : undefined);
  const commentsQuery = useBoardCommentsQuery(Number.isFinite(postId) ? postId : undefined);
  const createCommentMutation = useCreateBoardCommentMutation(postId);
  const session = useAuthStore((state) => state.session);
  const [comment, setComment] = useState("");

  if (!postQuery.data) {
    return <PageLoadingOverlay message="게시글을 불러오는 중입니다." />;
  }

  const post = postQuery.data;
  const canComment = post.type === "qna" && session?.user.accountStatus === "approved";

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow={getBoardTypeLabel(post.type)}
        title={post.title}
        description={`${post.authorName} · ${formatDateTime(post.createdAt)}`}
        titleClassName="font-normal"
      />

      <section className="surface-panel rounded-lg p-6">
        <MarkdownRenderer content={post.content} />
      </section>

      <section className="page-stagger-group grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="surface-panel rounded-lg border-border bg-transparent">
          <CardHeader>
            <CardTitle>댓글</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CommentList items={commentsQuery.data ?? []} />
          </CardContent>
        </Card>
        <Card className="surface-panel rounded-lg border-border bg-transparent">
          <CardHeader>
            <CardTitle>답변 작성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CommentComposer
              canSubmit={canComment}
              value={comment}
              onChange={setComment}
              isPending={createCommentMutation.isPending}
              blockedTitle="댓글 작성 제한"
              blockedDescription="Q&A에서 승인된 사용자만 댓글을 작성할 수 있습니다."
              onSubmit={async () => {
                await createCommentMutation.mutateAsync({ content: comment });
                setComment("");
              }}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
