/**
 * 목적: 관리자 대시보드 전용 조회 훅을 제공한다.
 * 설명: 관리자 KPI 응답을 페이지 전용 query key로 조회해 UI 의존성을 줄인다.
 * 적용 패턴: Query 캡슐화 패턴
 * 참조: ui/src/pages/admin/dashboard/model/types.ts, ui/src/shared/api/http/client.ts
 */
import { useQuery } from "@tanstack/react-query";

import { getRequest } from "@/shared/api/http/client";
import type { AdminDashboard } from "@/pages/admin/dashboard/model/types";

export const adminDashboardQueryKeys = {
  dashboard: ["admin-dashboard"] as const,
};

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: adminDashboardQueryKeys.dashboard,
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ dashboard: AdminDashboard }>("/admin/dashboard", {
        signal,
      });
      return response.dashboard;
    },
  });
}
