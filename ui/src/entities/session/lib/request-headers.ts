/**
 * 목적: 현재 세션을 요청 헤더로 변환한다.
 * 설명: Mock API가 기대하는 사용자 컨텍스트 헤더를 한 곳에서 생성해 일관성을 보장한다.
 * 적용 패턴: 어댑터 패턴
 * 참조: ui/src/entities/session/model/types.ts, ui/src/shared/api/http/request-context.ts
 */
import type { UserSession } from "@/entities/session/model/types";

export function toSessionRequestHeaders(session: UserSession | null): Record<string, string> {
  if (!session) {
    return {};
  }

  return {
    "x-user-id": String(session.user.id),
    "x-user-role": session.user.globalRole,
    "x-user-status": session.user.accountStatus,
    "x-managed-project-ids": session.managedProjectIds.join(","),
  };
}
