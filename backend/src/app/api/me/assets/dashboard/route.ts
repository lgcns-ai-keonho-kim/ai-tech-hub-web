/**
 * 목적: 내 자산 대시보드 집계 API를 제공한다.
 * 설명: 등록 자산 수와 다운로드/좋아요/즐겨찾기 합계를 함께 반환한다.
 * 적용 패턴: 개인화 집계 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { getMyAssetDashboard } from "@/db/repositories";
import { requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireSessionUser(request);
    return { dashboard: getMyAssetDashboard(session.id) };
  });
}
