/**
 * 목적: 사용자 엔티티가 소유하는 타입 계약을 정의한다.
 * 설명: 관리자 사용자 관리와 내 프로필 수정 흐름이 같은 사용자 모델을 공유하게 한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/entities/user/model/queries.ts, ui/src/features/profile/model/mutations.ts
 */
import type { AccountStatus, GlobalRole, ProjectRole } from "@/entities/session/model/types";

export type AdminUserSummary = {
  id: number;
  email: string;
  name: string;
  accountStatus: AccountStatus;
  globalRole: GlobalRole;
  managedProjects: string[];
  projectMemberships: Array<{
    projectId: number;
    projectName: string;
    role: ProjectRole;
  }>;
  createdAt: string;
};

export type UpdateProfileInput = {
  name: string;
  email: string;
};

export type UpdatePasswordInput = {
  currentPassword: string;
  nextPassword: string;
};
