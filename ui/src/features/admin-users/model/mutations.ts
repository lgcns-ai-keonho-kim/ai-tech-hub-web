/**
 * 목적: 관리자 사용자 관리 피처의 변경 훅을 제공한다.
 * 설명: 승인/거절과 프로젝트 역할 관리, 캐시 무효화를 사용자 관리 피처에 모은다.
 * 적용 패턴: Mutation 캡슐화 패턴
 * 참조: ui/src/entities/user/model/queries.ts, ui/src/entities/project/model/queries.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectQueryKeys } from "@/entities/project/model/queries";
import { userQueryKeys } from "@/entities/user/model/queries";
import {
  deleteRequest,
  postRequest,
} from "@/shared/api/http/client";

export function useApproveUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => postRequest<{ approved: boolean }>(`/admin/users/${userId}/approve`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.adminUsers });
      toast.success("사용자를 승인했습니다.");
    },
  });
}

export function useRejectUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { userId: number; reason: string }) =>
      postRequest<{ rejected: boolean }, { reason: string }>(`/admin/users/${payload.userId}/reject`, {
        reason: payload.reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.adminUsers });
      toast.success("사용자를 거절했습니다.");
    },
  });
}

export function useUpdateProjectMembershipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { userId: number; projectId: number; role: "user" | "manager" }) =>
      postRequest<{ updated: boolean }, { projectId: number; role: "user" | "manager" }>(
        `/admin/users/${payload.userId}/project-membership`,
        {
          projectId: payload.projectId,
          role: payload.role,
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.adminUsers });
      toast.success("프로젝트 역할이 반영되었습니다.");
    },
  });
}

export function useDeleteProjectMembershipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { userId: number; projectId: number }) =>
      deleteRequest<{ deleted: boolean }, { projectId: number }>(
        `/admin/users/${payload.userId}/project-membership`,
        {
          data: { projectId: payload.projectId },
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.adminUsers });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.projects() });
      toast.success("프로젝트 역할이 제거되었습니다.");
    },
  });
}
