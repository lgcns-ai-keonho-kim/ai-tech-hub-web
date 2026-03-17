/**
 * 목적: 자산 카테고리 목록 조회 API를 제공한다.
 * 설명: kind 기준 필터를 지원해 목록 화면과 관리자 화면이 같은 엔드포인트를 재사용하게 한다.
 * 적용 패턴: 조회 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { listAssetCategories } from "@/db/repositories";
import { categoryQuerySchema } from "@/lib/contracts";
import { withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    const query = categoryQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );

    return {
      categories: listAssetCategories(query.kind),
    };
  });
}
