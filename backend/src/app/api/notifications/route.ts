/**
 * 목적: 현재 사용자 알림 목록 API를 제공한다.
 * 설명: 승인 결과와 댓글 알림을 최신순으로 반환한다.
 * 적용 패턴: 조회 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { listNotifications } from "@/db/repositories";
import { requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    const currentUser = await requireSessionUser(request);
    return { notifications: listNotifications(currentUser.id) };
  });
}
