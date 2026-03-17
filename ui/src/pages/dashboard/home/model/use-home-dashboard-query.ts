/**
 * 목적: 홈 대시보드 전용 조회 훅을 제공한다.
 * 설명: 세션 상태를 query key에 반영해 사용자별 홈 집계 캐시를 안정적으로 분리한다.
 * 적용 패턴: Query 캡슐화 패턴
 * 참조: ui/src/pages/dashboard/home/model/types.ts, ui/src/entities/session/model/store.ts
 */
import { useQuery } from "@tanstack/react-query";

import { useSessionStore } from "@/entities/session/model/store";
import { getRequest } from "@/shared/api/http/client";
import type { HomeDashboard } from "@/pages/dashboard/home/model/types";

export const homeDashboardQueryKeys = {
  dashboard: (userId: number, role: string) => ["home-dashboard", userId, role] as const,
};

export function useHomeDashboardQuery() {
  const session = useSessionStore((state) => state.session);

  return useQuery({
    queryKey: homeDashboardQueryKeys.dashboard(
      session?.user.id ?? 0,
      session?.user.globalRole ?? "guest",
    ),
    enabled: Boolean(session),
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ dashboard: HomeDashboard }>("/me/home/dashboard", {
        signal,
      });
      return response.dashboard;
    },
  });
}
