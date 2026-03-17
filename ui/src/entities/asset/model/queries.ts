/**
 * 목적: 자산 엔티티가 소유하는 조회 훅을 제공한다.
 * 설명: 자산 목록, 카테고리, 상세, 댓글, 개인 자산 요약을 자산 레이어에서 일관되게 조회한다.
 * 적용 패턴: Query 캡슐화 패턴
 * 참조: ui/src/entities/asset/model/types.ts, ui/src/shared/api/http/client.ts
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  getRequest,
} from "@/shared/api/http/client";
import type {
  AssetCategory,
  AssetComment,
  AssetDetail,
  AssetKind,
  AssetSort,
  AssetSummary,
  MyAssetDashboard,
  PaginatedAssets,
} from "@/entities/asset/model/types";

export const assetQueryKeys = {
  categories: (kind?: AssetKind) => ["asset-categories", kind ?? "all"] as const,
  assets: (params: Record<string, unknown>) => ["assets", params] as const,
  asset: (assetId: number) => ["asset", assetId] as const,
  assetComments: (assetId: number) => ["asset-comments", assetId] as const,
  myAssets: ["my-assets"] as const,
  myFavorites: ["my-favorites"] as const,
  myDownloads: ["my-downloads"] as const,
  myDashboard: ["my-dashboard"] as const,
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

export function useAssetCategoriesQuery(kind?: AssetKind) {
  return useQuery({
    queryKey: assetQueryKeys.categories(kind),
    queryFn: async ({ signal }) => {
      const search = buildSearchParams({ kind });
      const response = await getRequest<{ categories: AssetCategory[] }>(
        `/asset-categories${search ? `?${search}` : ""}`,
        { signal },
      );
      return response.categories;
    },
  });
}

export function usePaginatedAssetsQuery(input: {
  kind?: AssetKind;
  sort: AssetSort;
  query?: string;
  categoryId?: number;
  projectId?: number;
  status?: string;
  page: number;
  pageSize: number;
}) {
  return useQuery({
    queryKey: assetQueryKeys.assets(input),
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const search = buildSearchParams(input);
      return getRequest<PaginatedAssets>(`/assets${search ? `?${search}` : ""}`, { signal });
    },
  });
}

export function useAssetDetailQuery(assetId?: number) {
  return useQuery({
    queryKey: assetQueryKeys.asset(assetId ?? 0),
    enabled: Boolean(assetId),
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ asset: AssetDetail }>(`/assets/${assetId}`, { signal });
      return response.asset;
    },
  });
}

export function useAssetCommentsQuery(assetId?: number) {
  return useQuery({
    queryKey: assetQueryKeys.assetComments(assetId ?? 0),
    enabled: Boolean(assetId),
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ comments: AssetComment[] }>(
        `/assets/${assetId}/comments`,
        { signal },
      );
      return response.comments;
    },
  });
}

export function useMyAssetsQuery() {
  return useQuery({
    queryKey: assetQueryKeys.myAssets,
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ assets: AssetSummary[] }>("/me/assets", { signal });
      return response.assets;
    },
  });
}

export function useMyFavoritesQuery() {
  return useQuery({
    queryKey: assetQueryKeys.myFavorites,
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ assets: AssetSummary[] }>("/me/favorites", { signal });
      return response.assets;
    },
  });
}

export function useMyDownloadsQuery() {
  return useQuery({
    queryKey: assetQueryKeys.myDownloads,
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ assets: AssetSummary[] }>("/me/downloads", { signal });
      return response.assets;
    },
  });
}

export function useMyAssetDashboardQuery() {
  return useQuery({
    queryKey: assetQueryKeys.myDashboard,
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ dashboard: MyAssetDashboard }>(
        "/me/assets/dashboard",
        { signal },
      );
      return response.dashboard;
    },
  });
}
