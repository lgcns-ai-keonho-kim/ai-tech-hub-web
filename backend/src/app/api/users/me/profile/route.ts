/**
 * 목적: 로그인 사용자의 이름/이메일 변경 API를 제공한다.
 * 설명: MyPage 기본 정보 수정 후 최신 세션 정보를 다시 반환한다.
 * 적용 패턴: 수정 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { updateUserProfile } from "@/db/repositories";
import { updateProfileBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function PATCH(request: Request) {
  return withErrorBoundary(async () => {
    const currentUser = await requireSessionUser(request);
    const body = await parseJsonBody(request, updateProfileBodySchema);
    const nextSession = await updateUserProfile(currentUser.id, body);

    if (!nextSession) {
      throw new ApiError({
        status: 500,
        code: "session_refresh_failed",
        message: "프로필 수정 후 세션 정보를 다시 불러오지 못했습니다.",
      });
    }

    return { session: nextSession };
  });
}
