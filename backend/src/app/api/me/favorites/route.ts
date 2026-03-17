/**
 * 목적: 내 즐겨찾기/좋아요 자산 목록 API를 제공한다.
 * 설명: 사용자 상호작용 기록 중 즐겨찾기 또는 좋아요된 자산을 반환한다.
 * 적용 패턴: 개인화 조회 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { listMyFavoriteAssets } from "@/db/repositories";
import { requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    const currentUser = await requireSessionUser(request);
    return { assets: listMyFavoriteAssets(currentUser.id) };
  });
}
