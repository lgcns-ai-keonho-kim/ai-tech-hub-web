/**
 * 목적: 단일 자산의 상세 정보를 렌더링한다.
 * 설명: 본문, 메타정보, 상호작용 버튼, 댓글 스레드를 한 화면에 통합한다.
 * 적용 패턴: 상세 화면 조합 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/shared/lib/markdown.tsx
 */
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/shared/ui/primitives/badge";
import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import {
  useCreateAssetCommentMutation,
  useDownloadAssetMutation,
  useFavoriteAssetMutation,
  useLikeAssetMutation,
} from "@/features/asset-actions/model/mutations";
import { CommentComposer } from "@/features/comments/ui/comment-composer";
import { CommentList } from "@/features/comments/ui/comment-list";
import { getAssetKindLabel, getAssetStatusLabel } from "@/entities/asset/lib/labels";
import { useAssetCommentsQuery, useAssetDetailQuery } from "@/entities/asset/model/queries";
import { getStageBadgeStyle, isStagePillTone } from "@/entities/project/lib/stage";
import { formatCompactNumber, formatDateTime } from "@/shared/lib/format";
import { MarkdownRenderer } from "@/shared/lib/markdown";
import { PageLoadingOverlay } from "@/shared/ui/page-loading-overlay";
import { SectionHero } from "@/shared/ui/section-hero";
import { useAuthStore } from "@/entities/session/model/store";

export function AssetDetailPage() {
  const params = useParams();
  const assetId = Number(params.assetId);
  const assetQuery = useAssetDetailQuery(Number.isFinite(assetId) ? assetId : undefined);
  const commentsQuery = useAssetCommentsQuery(Number.isFinite(assetId) ? assetId : undefined);
  const likeMutation = useLikeAssetMutation();
  const favoriteMutation = useFavoriteAssetMutation();
  const downloadMutation = useDownloadAssetMutation();
  const commentMutation = useCreateAssetCommentMutation(assetId);
  const session = useAuthStore((state) => state.session);
  const [comment, setComment] = useState("");

  if (!assetQuery.data) {
    return <PageLoadingOverlay message="자산 정보를 불러오는 중입니다." />;
  }

  const asset = assetQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow={getAssetKindLabel(asset.kind)}
        title={asset.title}
        description={asset.summary}
        meta={(
          <>
            <Badge variant="outline" className="rounded-md border-border bg-background">
              {getAssetStatusLabel(asset.status)}
            </Badge>
            <Badge
              variant="outline"
              style={asset.kind === "knowledge" && isStagePillTone(asset.categorySlug)
                ? getStageBadgeStyle(asset.categorySlug)
                : undefined}
              className="rounded-md border-border bg-background"
            >
              {asset.categoryName}
            </Badge>
            {asset.projectName ? (
              <Badge variant="outline" className="rounded-md border-border bg-background">
                <Link to={`/projects/${asset.projectId}`}>{asset.projectName}</Link>
              </Badge>
            ) : null}
          </>
        )}
        actions={(
          <>
            <Button type="button" className="rounded-md" onClick={() => likeMutation.mutate(asset.id)}>
              좋아요 {formatCompactNumber(asset.likeCount)}
            </Button>
            <Button type="button" variant="outline" className="rounded-md border-border bg-background" onClick={() => favoriteMutation.mutate(asset.id)}>
              즐겨찾기 {formatCompactNumber(asset.favoriteCount)}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-md border-border bg-background"
              disabled={!asset.attachmentUrl && !asset.externalUrl}
              onClick={() => downloadMutation.mutate(asset.id)}
            >
              다운로드 {formatCompactNumber(asset.downloadCount)}
            </Button>
          </>
        )}
        aside={(
          <div className="surface-panel-muted rounded-lg p-5 text-sm leading-7 text-muted-foreground">
            <div>작성자 {asset.ownerName}</div>
            <div>등록 {formatDateTime(asset.createdAt)}</div>
            <div>수정 {formatDateTime(asset.updatedAt)}</div>
            {asset.attachmentName ? (
              <div>
                첨부 {asset.attachmentName}
                {!asset.attachmentUrl ? (
                  <div className="text-xs text-muted-foreground">mock 미리보기만 저장됨</div>
                ) : null}
              </div>
            ) : null}
            {asset.rejectedReason ? <div>거절 사유 {asset.rejectedReason}</div> : null}
          </div>
        )}
      />

      <section className="surface-panel rounded-lg p-6">
        <MarkdownRenderer content={asset.content} />
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
            <CardTitle>댓글 작성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CommentComposer
              canSubmit={Boolean(session)}
              value={comment}
              onChange={setComment}
              isPending={commentMutation.isPending}
              blockedTitle="로그인이 필요합니다."
              blockedDescription="댓글은 승인된 사용자만 작성할 수 있습니다."
              onSubmit={async () => {
                await commentMutation.mutateAsync({ content: comment });
                setComment("");
              }}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
