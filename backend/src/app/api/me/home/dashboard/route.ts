/**
 * 목적: 홈 카드형 대시보드 집계 API를 제공한다.
 * 설명: 자산 종류별 총 자산 수, 새 글/댓글 증감, 관리자용 승인 대기 수를 홈 화면에서 바로 사용할 수 있게 반환한다.
 * 적용 패턴: 개인화 홈 집계 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { getHomeDashboard } from "@/db/repositories";
import { requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireSessionUser(request);
    return { dashboard: getHomeDashboard(session) };
  });
}
