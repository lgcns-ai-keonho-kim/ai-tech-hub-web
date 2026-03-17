/**
 * 목적: 관리자 사용자 목록 API를 제공한다.
 * 설명: 가입 승인/거절과 권한 현황 화면에 필요한 사용자 목록을 반환한다.
 * 적용 패턴: 관리자 조회 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { listUsersForAdmin } from "@/db/repositories";
import { requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    return { users: listUsersForAdmin() };
  });
}
