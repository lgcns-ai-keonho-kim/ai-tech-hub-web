/**
 * 목적: 자산 댓글 조회와 등록 API를 제공한다.
 * 설명: 자산 상세의 댓글 스레드와 알림 발생 지점을 함께 관리한다.
 * 적용 패턴: 하위 컬렉션 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { createAssetComment, getAssetById, listAssetComments } from "@/db/repositories";
import { createCommentBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireSessionUser(request);
    const params = await context.params;
    const assetId = Number(params.id);
    return { comments: listAssetComments(assetId) };
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    const currentUser = await requireSessionUser(request);
    const params = await context.params;
    const assetId = Number(params.id);
    const asset = await getAssetById(assetId, currentUser.id);

    if (!asset) {
      throw new ApiError({
        status: 404,
        code: "asset_not_found",
        message: "자산을 찾을 수 없습니다.",
      });
    }

    const body = await parseJsonBody(request, createCommentBodySchema);
    const comment = await createAssetComment(currentUser.id, assetId, body.content);
    return { comment };
  });
}
