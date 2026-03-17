/**
 * 목적: 자산 목록 조회와 등록 API를 제공한다.
 * 설명: 통합 자산 코어의 조회/생성 흐름을 한 엔드포인트에서 관리한다.
 * 적용 패턴: 컬렉션 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import {
  createAsset,
  hasAssetCategory,
  hasProject,
  isProjectMember,
  listAssets,
  listAssetsPaginated,
} from "@/db/repositories";
import { createAssetBodySchema, listAssetsQuerySchema } from "@/lib/contracts";
import {
  ApiError,
  getOptionalSessionUserId,
  requireSessionUser,
  withErrorBoundary,
  parseJsonBody,
} from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    const query = listAssetsQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );

    if (query.page && query.pageSize) {
      const { page, pageSize, ...filters } = query;

      return listAssetsPaginated({
        ...filters,
        page,
        pageSize,
        currentUserId: getOptionalSessionUserId(request),
      });
    }

    return {
      assets: listAssets({
        ...query,
        currentUserId: getOptionalSessionUserId(request),
      }),
    };
  });
}

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const currentUser = await requireSessionUser(request);
    const body = await parseJsonBody(request, createAssetBodySchema);

    if (!(await hasAssetCategory(body.categoryId))) {
      throw new ApiError({
        status: 404,
        code: "category_not_found",
        message: "존재하지 않는 카테고리입니다.",
      });
    }

    if (body.kind !== "code") {
      if (!body.projectId) {
        throw new ApiError({
          status: 400,
          code: "project_required",
          message: "프로젝트 연결 자산은 프로젝트 검색이 필요합니다.",
        });
      }

      if (!(await hasProject(body.projectId))) {
        throw new ApiError({
          status: 404,
          code: "project_not_found",
          message: "존재하지 않는 프로젝트입니다.",
        });
      }

      if (!(await isProjectMember(body.projectId, currentUser.id))) {
        throw new ApiError({
          status: 403,
          code: "project_membership_required",
          message: "프로젝트 연결 자산은 해당 프로젝트 구성원만 등록할 수 있습니다.",
        });
      }
    }

    const asset = await createAsset(currentUser.id, body);

    return { asset };
  });
}
