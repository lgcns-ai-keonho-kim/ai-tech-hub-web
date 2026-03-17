/**
 * 목적: 가입 승인 API를 제공한다.
 * 설명: 관리자가 대기 또는 거절 상태 사용자를 승인 상태로 변경한다.
 * 적용 패턴: 액션 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { approveUser } from "@/db/repositories";
import { requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const params = await context.params;
    await approveUser(Number(params.id));
    return { approved: true };
  });
}
