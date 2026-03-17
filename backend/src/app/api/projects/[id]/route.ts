/**
 * 목적: 프로젝트 상세와 연결 자산 조회 API를 제공한다.
 * 설명: 프로젝트 메타와 승인된 연결 자산 목록을 함께 반환한다.
 * 적용 패턴: 단건 조회 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { getProjectById } from "@/db/repositories";
import { ApiError, requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireSessionUser(request);
    const params = await context.params;
    const project = await getProjectById(Number(params.id));

    if (!project) {
      throw new ApiError({
        status: 404,
        code: "project_not_found",
        message: "프로젝트를 찾을 수 없습니다.",
      });
    }

    return project;
  });
}
