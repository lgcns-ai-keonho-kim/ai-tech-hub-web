/**
 * 목적: 관리자 프로젝트 관리 피처의 변경 훅을 제공한다.
 * 설명: 생성, 수정, 삭제 preview, 삭제와 관련 캐시 무효화를 프로젝트 관리 피처에 모은다.
 * 적용 패턴: Mutation 캡슐화 패턴
 * 참조: ui/src/entities/project/model/queries.ts, ui/src/entities/project/model/types.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notificationQueryKeys } from "@/entities/notification/model/queries";
import { projectQueryKeys } from "@/entities/project/model/queries";
import type {
  CreateProjectInput,
  DeleteImpactSummary,
  ProjectSummary,
  UpdateProjectInput,
} from "@/entities/project/model/types";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@/shared/api/http/client";

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      postRequest<{ project: ProjectSummary }, CreateProjectInput>("/admin/projects", input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("프로젝트가 생성되었습니다.");
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { projectId: number; input: UpdateProjectInput }) =>
      patchRequest<{ project: ProjectSummary }, UpdateProjectInput>(
        `/admin/projects/${payload.projectId}`,
        payload.input,
      ),
    onSuccess: (_response, payload) => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.project(payload.projectId) });
      toast.success("프로젝트가 수정되었습니다.");
    },
  });
}

export function useProjectDeletePreviewMutation() {
  return useMutation({
    mutationFn: (projectId: number) =>
      getRequest<{ preview: DeleteImpactSummary & { projectId: number; projectName: string } }>(
        `/admin/projects/${projectId}/delete-preview`,
      ),
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) =>
      deleteRequest<{ deleted: boolean }>(`/admin/projects/${projectId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.approvalsRoot });
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      toast.success("프로젝트와 연결 자산이 삭제되었습니다.");
    },
  });
}
