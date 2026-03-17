/**
 * 목적: 프로젝트 삭제 영향도 preview API를 제공한다.
 * 설명: 이중 확인 모달에서 사용할 연결 자산 총량과 카테고리별 집계를 반환한다.
 * 적용 패턴: 삭제 preview 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { getProjectDeletePreview } from "@/db/repositories";
import { ApiError, requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const params = await context.params;
    const preview = getProjectDeletePreview(Number(params.id));

    if (!preview) {
      throw new ApiError({
        status: 404,
        code: "project_not_found",
        message: "프로젝트를 찾을 수 없습니다.",
      });
    }

    return { preview };
  });
}
