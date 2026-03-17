/**
 * 목적: 사용자 관련 시드를 정의한다.
 * 설명: 로그인, 승인, 관리자/매니저 역할 검증에 필요한 기본 계정을 제공한다.
 * 적용 패턴: 페이지 시드 모듈 패턴
 * 참조: backend/src/db/seed-pages/types.ts
 */
import { iso } from "@/db/seed-pages/shared";
import type { SeedBundle } from "@/db/seed-pages/types";

export const usersPageSeed: SeedBundle = {
  users: [
    { id: 1, email: "admin@mock.local", passwordHash: "admin123!", name: "관리자", accountStatus: "approved", globalRole: "admin", createdAt: iso(1, 9), updatedAt: iso(1, 9) },
    { id: 2, email: "manager@mock.local", passwordHash: "manager123!", name: "김하늘", accountStatus: "approved", globalRole: "user", createdAt: iso(2, 9), updatedAt: iso(2, 9) },
    { id: 3, email: "user@mock.local", passwordHash: "user123!", name: "정다은", accountStatus: "approved", globalRole: "user", createdAt: iso(3, 9), updatedAt: iso(3, 9) },
    { id: 4, email: "pending@mock.local", passwordHash: "pending123!", name: "승인 대기 사용자", accountStatus: "pending", globalRole: "user", createdAt: iso(4, 9), updatedAt: iso(4, 9) },
    { id: 5, email: "architect@mock.local", passwordHash: "architect123!", name: "이준호", accountStatus: "approved", globalRole: "user", createdAt: iso(5, 9), updatedAt: iso(5, 9) },
    { id: 6, email: "qa@mock.local", passwordHash: "qa123!", name: "박서연", accountStatus: "approved", globalRole: "user", createdAt: iso(6, 9), updatedAt: iso(6, 9) },
    { id: 7, email: "devops@mock.local", passwordHash: "devops123!", name: "최민석", accountStatus: "approved", globalRole: "user", createdAt: iso(7, 9), updatedAt: iso(7, 9) },
  ],
};
