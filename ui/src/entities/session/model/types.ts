/**
 * 목적: 세션 엔티티가 소유하는 인증/권한 타입을 정의한다.
 * 설명: 전역 세션, 권한 게이트, API 헤더 주입이 동일한 계약을 공유하도록 유지한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/entities/session/model/store.ts, ui/src/entities/session/lib/request-headers.ts
 */
export type AccountStatus = "pending" | "approved" | "rejected";
export type GlobalRole = "user" | "admin";
export type ProjectRole = "user" | "manager";

export type UserSession = {
  user: {
    id: number;
    email: string;
    name: string;
    accountStatus: AccountStatus;
    globalRole: GlobalRole;
  };
  managedProjectIds: number[];
};
