/**
 * 목적: 알림 피처가 소유하는 변경 훅을 제공한다.
 * 설명: 읽음 처리와 캐시 무효화 책임을 알림 피처에 모은다.
 * 적용 패턴: Mutation 캡슐화 패턴
 * 참조: ui/src/entities/notification/model/queries.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationQueryKeys } from "@/entities/notification/model/queries";
import { postRequest } from "@/shared/api/http/client";

export function useReadNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      postRequest<{ read: boolean }>(`/notifications/${notificationId}/read`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}
