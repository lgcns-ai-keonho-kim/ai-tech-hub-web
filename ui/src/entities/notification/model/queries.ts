/**
 * 목적: 알림 엔티티가 소유하는 조회 훅과 쿼리 옵션을 제공한다.
 * 설명: 사용자 세션 단위로 알림 쿼리 키를 분리해 로그인 직후와 사용자 전환 시 캐시 의미를 명확히 유지한다.
 * 적용 패턴: Query 캡슐화 패턴
 * 참조: ui/src/entities/notification/model/types.ts, ui/src/entities/session/model/store.ts
 */
import { queryOptions, useQuery } from "@tanstack/react-query";

import { getRequest } from "@/shared/api/http/client";
import type { NotificationItem } from "@/entities/notification/model/types";
import { useAuthStore } from "@/entities/session/model/store";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  notifications: (userId: number | null) => ["notifications", userId ?? "guest"] as const,
};

export function createNotificationsQueryOptions(userId: number) {
  return queryOptions({
    queryKey: notificationQueryKeys.notifications(userId),
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ notifications: NotificationItem[] }>("/notifications", {
        signal,
      });
      return response.notifications;
    },
  });
}

export function useNotificationsQuery() {
  const approvedUserId = useAuthStore((state) =>
    state.session?.user.accountStatus === "approved" ? state.session.user.id : null,
  );

  return useQuery({
    ...createNotificationsQueryOptions(approvedUserId ?? 0),
    enabled: approvedUserId !== null,
  });
}
