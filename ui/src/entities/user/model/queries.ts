/**
 * 목적: 사용자 엔티티가 소유하는 조회 훅을 제공한다.
 * 설명: 관리자 사용자 목록을 사용자 레이어에서 일관되게 조회한다.
 * 적용 패턴: Query 캡슐화 패턴
 * 참조: ui/src/entities/user/model/types.ts, ui/src/shared/api/http/client.ts
 */
import { useQuery } from "@tanstack/react-query";

import { getRequest } from "@/shared/api/http/client";
import type { AdminUserSummary } from "@/entities/user/model/types";

export const userQueryKeys = {
  adminUsers: ["admin-users"] as const,
};

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: userQueryKeys.adminUsers,
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ users: AdminUserSummary[] }>("/admin/users", { signal });
      return response.users;
    },
  });
}
