/**
 * 목적: 프로젝트 자산 거절 API를 제공한다.
 * 설명: 자산의 프로젝트 매니저만 pending 자산을 거절할 수 있게 한다.
 * 적용 패턴: 액션 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts, backend/src/lib/contracts.ts
 */
import { getAssetById, rejectAsset } from "@/db/repositories";
import { rejectReasonBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, requireManagerForProject, withErrorBoundary } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ assetId: string }> },
) {
  return withErrorBoundary(async () => {
    const params = await context.params;
    const assetId = Number(params.assetId);
    const asset = await getAssetById(assetId);

    if (!asset || !asset.projectId) {
      throw new ApiError({
        status: 404,
        code: "asset_not_found",
        message: "거절할 자산을 찾을 수 없습니다.",
      });
    }

    const manager = await requireManagerForProject(request, asset.projectId);
    const body = await parseJsonBody(request, rejectReasonBodySchema);
    await rejectAsset(assetId, manager.id, body.reason);
    return { rejected: true };
  });
}
