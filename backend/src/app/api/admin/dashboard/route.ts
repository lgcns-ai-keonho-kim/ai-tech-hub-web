/**
 * 목적: 관리자 대시보드 집계 API를 제공한다.
 * 설명: 사용자 수와 자산 분포를 운영 화면에서 바로 사용할 수 있는 구조로 반환한다.
 * 적용 패턴: 관리자 집계 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { getAdminDashboard } from "@/db/repositories";
import { requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    return { dashboard: getAdminDashboard() };
  });
}
