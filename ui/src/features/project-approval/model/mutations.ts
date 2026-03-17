/**
 * 목적: 프로젝트 승인 대기열 피처의 변경 훅을 제공한다.
 * 설명: 승인/거절과 관련 캐시 무효화를 프로젝트 승인 피처에 모은다.
 * 적용 패턴: Mutation 캡슐화 패턴
 * 참조: ui/src/entities/project/model/queries.ts, ui/src/entities/asset/model/queries.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectQueryKeys } from "@/entities/project/model/queries";
import { postRequest } from "@/shared/api/http/client";

export function useApproveProjectAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: number) =>
      postRequest<{ approved: boolean }>(`/me/project-approvals/${assetId}/approve`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.approvalsRoot });
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("자산을 승인했습니다.");
    },
  });
}

export function useRejectProjectAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { assetId: number; reason: string }) =>
      postRequest<{ rejected: boolean }, { reason: string }>(
        `/me/project-approvals/${payload.assetId}/reject`,
        { reason: payload.reason },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.approvalsRoot });
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("자산을 거절했습니다.");
    },
  });
}
