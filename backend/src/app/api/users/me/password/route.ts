/**
 * 목적: 로그인 사용자의 비밀번호 변경 API를 제공한다.
 * 설명: 현재 비밀번호 검증 후 새 비밀번호로 교체한다.
 * 적용 패턴: 수정 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { updateUserPassword } from "@/db/repositories";
import { updatePasswordBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function PATCH(request: Request) {
  return withErrorBoundary(async () => {
    const currentUser = await requireSessionUser(request);
    const body = await parseJsonBody(request, updatePasswordBodySchema);
    const result = await updateUserPassword(currentUser.id, body);

    if (result === "invalid_current_password") {
      throw new ApiError({
        status: 400,
        code: "invalid_current_password",
        message: "현재 비밀번호가 올바르지 않습니다.",
      });
    }

    return { updated: true };
  });
}
