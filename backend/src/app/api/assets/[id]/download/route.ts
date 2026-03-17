/**
 * 목적: 자산 다운로드 기록 API를 제공한다.
 * 설명: 첨부 또는 외부 링크가 있는 자산만 다운로드 이력을 남기게 한다.
 * 적용 패턴: 액션 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { getAssetById, recordAssetDownload } from "@/db/repositories";
import { ApiError, requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    const session = await requireSessionUser(request);
    const params = await context.params;
    const assetId = Number(params.id);
    const asset = await getAssetById(assetId, session.id);

    if (!asset) {
      throw new ApiError({
        status: 404,
        code: "asset_not_found",
        message: "자산을 찾을 수 없습니다.",
      });
    }

    if (!asset.attachmentUrl && !asset.externalUrl) {
      throw new ApiError({
        status: 409,
        code: "asset_not_downloadable",
        message: "첨부파일 또는 외부 링크가 없는 자산은 다운로드할 수 없습니다.",
      });
    }

    await recordAssetDownload(assetId, session.id);
    return { ok: true };
  });
}
