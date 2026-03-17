/**
 * 목적: 이메일/비밀번호 기반 Mock 로그인 API를 제공한다.
 * 설명: 승인 상태와 권한 정보를 함께 반환해 프런트의 보호 라우트 기준으로 사용한다.
 * 적용 패턴: 인증 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { loginWithEmail } from "@/db/repositories";
import { loginBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, withErrorBoundary } from "@/lib/http";

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const body = await parseJsonBody(request, loginBodySchema);
    const session = await loginWithEmail(body.email, body.password);

    if (!session) {
      throw new ApiError({
        status: 401,
        code: "invalid_credentials",
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    if (session.user.accountStatus === "pending") {
      throw new ApiError({
        status: 403,
        code: "account_pending_approval",
        message: "가입 승인 대기 중입니다.",
      });
    }

    if (session.user.accountStatus === "rejected") {
      throw new ApiError({
        status: 403,
        code: "account_rejected",
        message: "거절된 계정입니다. 관리자에게 문의해 주세요.",
      });
    }

    return { session };
  });
}
