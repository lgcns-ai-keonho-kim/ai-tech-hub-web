/**
 * 목적: 매니저 승인 대기 자산 목록 API를 제공한다.
 * 설명: 현재 사용자가 매니저인 프로젝트에 연결된 pending 자산만 반환한다.
 * 적용 패턴: 작업 대기열 조회 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { listProjectApprovalAssets } from "@/db/repositories";
import { requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireSessionUser(request);
    return { assets: listProjectApprovalAssets(session.id) };
  });
}
