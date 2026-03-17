/**
 * 목적: 단일 자산 상세 조회 API를 제공한다.
 * 설명: 공개 자산과 승인 대기 자산에 대한 접근 제어를 함께 처리한다.
 * 적용 패턴: 단건 조회 엔드포인트 패턴
 * 참조: backend/src/lib/http.ts, backend/src/db/repositories.ts
 */
import { getAssetById } from "@/db/repositories";
import { ApiError, requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    const currentUser = await requireSessionUser(request);
    const params = await context.params;
    const assetId = Number(params.id);

    if (!Number.isInteger(assetId) || assetId <= 0) {
      throw new ApiError({
        status: 400,
        code: "invalid_asset_id",
        message: "유효한 자산 ID가 필요합니다.",
      });
    }

    const asset = await getAssetById(assetId, currentUser.id);

    if (!asset) {
      throw new ApiError({
        status: 404,
        code: "asset_not_found",
        message: "자산을 찾을 수 없습니다.",
      });
    }

    if (
      asset.status !== "approved" &&
      asset.ownerUserId !== currentUser.id &&
      currentUser.globalRole !== "admin" &&
      (!asset.projectId || !currentUser.managedProjectIds.includes(asset.projectId))
    ) {
      throw new ApiError({
        status: 403,
        code: "asset_not_accessible",
        message: "접근할 수 없는 자산입니다.",
      });
    }

    return { asset };
  });
}
