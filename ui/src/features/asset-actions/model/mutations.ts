/**
 * 목적: 자산 관련 변경 훅을 제공한다.
 * 설명: 자산 등록, 좋아요/즐겨찾기/다운로드, 댓글 작성과 캐시 무효화를 자산 피처에 모은다.
 * 적용 패턴: Mutation 캡슐화 패턴
 * 참조: ui/src/entities/asset/model/queries.ts, ui/src/entities/comment/model/types.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  assetQueryKeys,
} from "@/entities/asset/model/queries";
import type {
  AssetComment,
  AssetDetail,
  CreateAssetInput,
} from "@/entities/asset/model/types";
import type { CreateCommentInput } from "@/entities/comment/model/types";
import { notificationQueryKeys } from "@/entities/notification/model/queries";
import { postRequest } from "@/shared/api/http/client";

export function useCreateAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAssetInput) =>
      postRequest<{ asset: AssetDetail }, CreateAssetInput>("/assets", input),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
      void queryClient.invalidateQueries({ queryKey: assetQueryKeys.myAssets });
      toast.success(
        response.asset.status === "pending"
          ? "자산이 승인 대기 상태로 등록되었습니다."
          : "자산이 등록되었습니다.",
      );
    },
  });
}

function useSimpleAssetAction(
  pathBuilder: (assetId: number) => string,
  successMessage: string,
  invalidateDetail = true,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: number) => postRequest<{ ok: boolean }>(pathBuilder(assetId)),
    onSuccess: (_response, assetId) => {
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
      if (invalidateDetail) {
        void queryClient.invalidateQueries({ queryKey: assetQueryKeys.asset(assetId) });
      }
      void queryClient.invalidateQueries({ queryKey: assetQueryKeys.myFavorites });
      void queryClient.invalidateQueries({ queryKey: assetQueryKeys.myDownloads });
      void queryClient.invalidateQueries({ queryKey: assetQueryKeys.myDashboard });
      toast.success(successMessage);
    },
  });
}

export function useLikeAssetMutation() {
  return useSimpleAssetAction(
    (assetId) => `/assets/${assetId}/like`,
    "좋아요 상태가 반영되었습니다.",
  );
}

export function useFavoriteAssetMutation() {
  return useSimpleAssetAction(
    (assetId) => `/assets/${assetId}/favorite`,
    "즐겨찾기 상태가 반영되었습니다.",
  );
}

export function useDownloadAssetMutation() {
  return useSimpleAssetAction(
    (assetId) => `/assets/${assetId}/download`,
    "다운로드 이력이 저장되었습니다.",
  );
}

export function useCreateAssetCommentMutation(assetId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      postRequest<{ comment: AssetComment }, CreateCommentInput>(`/assets/${assetId}/comments`, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assetQueryKeys.assetComments(assetId) });
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      toast.success("댓글이 등록되었습니다.");
    },
  });
}
