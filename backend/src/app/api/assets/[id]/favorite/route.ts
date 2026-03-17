/**
 * 목적: 자산 즐겨찾기 토글 API를 제공한다.
 * 설명: 사용자별 즐겨찾기 상태와 집계 수를 함께 업데이트한다.
 * 적용 패턴: 액션 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { toggleFavoriteAsset } from "@/db/repositories";
import { requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    const session = await requireSessionUser(request);
    const params = await context.params;
    await toggleFavoriteAsset(Number(params.id), session.id);
    return { ok: true };
  });
}
