/**
 * 목적: 관리자 사용자 관리 페이지의 입력 상태를 관리한다.
 * 설명: 거절 사유, 프로젝트 선택, 역할 선택 상태를 페이지 모델로 분리해 카드 렌더링과 책임을 나눈다.
 * 적용 패턴: 페이지 모델 패턴
 * 참조: ui/src/pages/admin/users/ui/page.tsx, ui/src/widgets/admin-users/ui/admin-user-card.tsx
 */
import { useState } from "react";

export function useAdminUserManagementState() {
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [selectedProjectIds, setSelectedProjectIds] = useState<Record<number, string>>({});
  const [selectedRoles, setSelectedRoles] = useState<Record<number, "user" | "manager">>({});

  return {
    reasons,
    selectedProjectIds,
    selectedRoles,
    setReasons,
    setSelectedProjectIds,
    setSelectedRoles,
  };
}
