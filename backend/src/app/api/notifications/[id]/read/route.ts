/**
 * 목적: 알림 읽음 처리 API를 제공한다.
 * 설명: 현재 사용자의 알림만 읽음 상태로 변경한다.
 * 적용 패턴: 액션 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { markNotificationRead } from "@/db/repositories";
import { requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    const currentUser = await requireSessionUser(request);
    const params = await context.params;
    await markNotificationRead(Number(params.id), currentUser.id);
    return { read: true };
  });
}
