/**
 * 목적: 프로젝트 엔티티가 소유하는 조회 훅과 쿼리 옵션을 제공한다.
 * 설명: 프로젝트 목록, 상세, 승인 대기열을 프로젝트 레이어에서 일관되게 조회하고 인증성 캐시를 세션 단위로 분리한다.
 * 적용 패턴: Query 캡슐화 패턴
 * 참조: ui/src/entities/project/model/types.ts, ui/src/entities/session/model/store.ts
 */
import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";

import { getRequest } from "@/shared/api/http/client";
import type {
  ProjectApprovalItem,
  ProjectDetailResponse,
  ProjectSummary,
} from "@/entities/project/model/types";
import { useAuthStore } from "@/entities/session/model/store";

export const projectQueryKeys = {
  projects: (query?: string) => ["projects", query ?? "all"] as const,
  project: (projectId: number) => ["project", projectId] as const,
  approvalsRoot: ["project-approvals"] as const,
  approvals: (userId: number | null, managedProjectIdsKey: string) =>
    ["project-approvals", userId ?? "guest", managedProjectIdsKey] as const,
};

function buildSearchParams(input: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

export function useProjectsQuery(query?: string) {
  return useQuery({
    queryKey: projectQueryKeys.projects(query),
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const search = buildSearchParams({ query });
      const response = await getRequest<{ projects: ProjectSummary[] }>(
        `/projects${search ? `?${search}` : ""}`,
        { signal },
      );
      return response.projects;
    },
  });
}

export function useProjectDetailQuery(projectId?: number) {
  return useQuery({
    queryKey: projectQueryKeys.project(projectId ?? 0),
    enabled: Boolean(projectId),
    queryFn: ({ signal }) => getRequest<ProjectDetailResponse>(`/projects/${projectId}`, { signal }),
  });
}

export function serializeManagedProjectIds(managedProjectIds: number[]) {
  return managedProjectIds.length > 0 ? managedProjectIds.join(",") : "none";
}

export function createProjectApprovalsQueryOptions(
  userId: number,
  managedProjectIdsKey: string,
) {
  return queryOptions({
    queryKey: projectQueryKeys.approvals(userId, managedProjectIdsKey),
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ assets: ProjectApprovalItem[] }>(
        "/me/project-approvals",
        { signal },
      );
      return response.assets;
    },
  });
}

export function useProjectApprovalsQuery() {
  const approvedUserId = useAuthStore((state) =>
    state.session?.user.accountStatus === "approved" ? state.session.user.id : null,
  );
  const managedProjectIdsKey = useAuthStore((state) => {
    const session = state.session;
    if (!session || session.user.accountStatus !== "approved") {
      return "none";
    }

    return serializeManagedProjectIds(session.managedProjectIds);
  });

  return useQuery({
    ...createProjectApprovalsQueryOptions(approvedUserId ?? 0, managedProjectIdsKey),
    enabled: approvedUserId !== null && managedProjectIdsKey !== "none",
  });
}
