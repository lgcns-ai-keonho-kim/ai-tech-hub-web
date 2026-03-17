/**
 * 목적: 관리자 프로젝트 수정/삭제 API를 제공한다.
 * 설명: 프로젝트 메타 수정과 연결 자산 cascade 삭제를 같은 리소스 경로에서 처리한다.
 * 적용 패턴: 관리자 단건 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { deleteProjectById, updateProjectById } from "@/db/repositories";
import { createProjectBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const params = await context.params;
    const projectId = Number(params.id);
    const body = await parseJsonBody(request, createProjectBodySchema);
    const project = await updateProjectById(projectId, body);

    if (!project) {
      throw new ApiError({
        status: 404,
        code: "project_not_found",
        message: "프로젝트를 찾을 수 없습니다.",
      });
    }

    return { project };
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const params = await context.params;
    const result = await deleteProjectById(Number(params.id));

    if (result === "not_found") {
      throw new ApiError({
        status: 404,
        code: "project_not_found",
        message: "프로젝트를 찾을 수 없습니다.",
      });
    }

    return { deleted: true };
  });
}
