/**
 * 목적: 사용자 프로젝트 역할 지정 API를 제공한다.
 * 설명: 관리자가 특정 사용자를 프로젝트의 user 또는 manager로 배정할 수 있게 한다.
 * 적용 패턴: 관리자 액션 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { deleteProjectMembership, hasProject, upsertProjectMembership } from "@/db/repositories";
import { projectMembershipBodySchema, projectMembershipRemoveBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const params = await context.params;
    const userId = Number(params.id);
    const body = await parseJsonBody(request, projectMembershipBodySchema);

    if (!(await hasProject(body.projectId))) {
      throw new ApiError({
        status: 404,
        code: "project_not_found",
        message: "존재하지 않는 프로젝트입니다.",
      });
    }

    await upsertProjectMembership({
      userId,
      projectId: body.projectId,
      role: body.role,
    });

    return { updated: true };
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const params = await context.params;
    const userId = Number(params.id);
    const body = await parseJsonBody(request, projectMembershipRemoveBodySchema);

    if (!(await hasProject(body.projectId))) {
      throw new ApiError({
        status: 404,
        code: "project_not_found",
        message: "존재하지 않는 프로젝트입니다.",
      });
    }

    await deleteProjectMembership({
      userId,
      projectId: body.projectId,
    });

    return { deleted: true };
  });
}
