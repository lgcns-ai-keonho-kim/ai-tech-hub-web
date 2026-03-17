/**
 * 목적: 관리자 카테고리 수정/삭제 API를 제공한다.
 * 설명: 카테고리 메타 수정과 연결 자산 cascade 삭제를 같은 리소스 경로에서 처리한다.
 * 적용 패턴: 관리자 단건 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { deleteCategoryById, updateCategoryById } from "@/db/repositories";
import { createCategoryBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const params = await context.params;
    const categoryId = Number(params.id);
    const body = await parseJsonBody(request, createCategoryBodySchema);
    const category = await updateCategoryById(categoryId, body);

    if (!category) {
      throw new ApiError({
        status: 404,
        code: "category_not_found",
        message: "카테고리를 찾을 수 없습니다.",
      });
    }

    return { category };
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const params = await context.params;
    const result = await deleteCategoryById(Number(params.id));

    if (result === "not_found") {
      throw new ApiError({
        status: 404,
        code: "category_not_found",
        message: "카테고리를 찾을 수 없습니다.",
      });
    }

    return { deleted: true };
  });
}
