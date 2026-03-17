/**
 * 목적: 관리자 카테고리 생성/조회 API를 제공한다.
 * 설명: 관리자 화면이 같은 엔드포인트로 목록과 생성을 처리하게 한다.
 * 적용 패턴: 관리자 컬렉션 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { createCategory, listAssetCategories } from "@/db/repositories";
import { categoryQuerySchema, createCategoryBodySchema } from "@/lib/contracts";
import { parseJsonBody, requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const query = categoryQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    return { categories: listAssetCategories(query.kind) };
  });
}

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const body = await parseJsonBody(request, createCategoryBodySchema);
    const category = await createCategory(body);
    return { category };
  });
}
