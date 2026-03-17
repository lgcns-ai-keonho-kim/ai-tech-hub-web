/**
 * 목적: 가입 승인형 Mock 회원가입 API를 제공한다.
 * 설명: 신규 계정을 pending 상태로 생성하고 관리자의 승인 전까지 로그인되지 않게 한다.
 * 적용 패턴: 생성 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { createPendingUser } from "@/db/repositories";
import { signupBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, withErrorBoundary } from "@/lib/http";

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const body = await parseJsonBody(request, signupBodySchema);
    const result = await createPendingUser(body);

    if (result === "duplicate") {
      throw new ApiError({
        status: 409,
        code: "email_already_exists",
        message: "이미 가입된 이메일입니다.",
      });
    }

    return {
      pending: true,
      message: "회원가입 요청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.",
    };
  });
}
