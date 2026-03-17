/**
 * 목적: 가입 거절 API를 제공한다.
 * 설명: 관리자가 대기 사용자를 거절 상태로 바꾸고 알림 메시지를 생성한다.
 * 적용 패턴: 액션 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts, backend/src/lib/contracts.ts
 */
import { rejectUser } from "@/db/repositories";
import { rejectReasonBodySchema } from "@/lib/contracts";
import { parseJsonBody, requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    const params = await context.params;
    const body = await parseJsonBody(request, rejectReasonBodySchema);
    await rejectUser(Number(params.id), body.reason);
    return { rejected: true };
  });
}
