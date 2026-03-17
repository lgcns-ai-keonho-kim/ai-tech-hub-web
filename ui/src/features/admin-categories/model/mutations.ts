/**
 * 목적: 관리자 카테고리 관리 피처의 변경 훅을 제공한다.
 * 설명: 생성, 수정, 삭제 preview, 삭제와 관련 캐시 무효화를 카테고리 관리 피처에 모은다.
 * 적용 패턴: Mutation 캡슐화 패턴
 * 참조: ui/src/entities/asset/model/queries.ts, ui/src/entities/project/model/types.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { assetQueryKeys } from "@/entities/asset/model/queries";
import type { AssetCategory, AssetKind } from "@/entities/asset/model/types";
import type { DeleteImpactSummary } from "@/entities/project/model/types";
import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@/shared/api/http/client";

type CreateCategoryInput = {
  kind: AssetKind;
  name: string;
  slug: string;
  sortOrder: number;
};

type UpdateCategoryInput = CreateCategoryInput;

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      postRequest<{ category: AssetCategory }, CreateCategoryInput>("/admin/categories", input),
    onSuccess: (_response, input) => {
      void queryClient.invalidateQueries({ queryKey: assetQueryKeys.categories(input.kind) });
      toast.success("카테고리가 추가되었습니다.");
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { categoryId: number; input: UpdateCategoryInput }) =>
      patchRequest<{ category: AssetCategory }, UpdateCategoryInput>(
        `/admin/categories/${payload.categoryId}`,
        payload.input,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["asset-categories"] });
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("카테고리가 수정되었습니다.");
    },
  });
}

export function useCategoryDeletePreviewMutation() {
  return useMutation({
    mutationFn: (categoryId: number) =>
      getRequest<{ preview: DeleteImpactSummary & { categoryId: number; categoryName: string } }>(
        `/admin/categories/${categoryId}/delete-preview`,
      ),
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) =>
      deleteRequest<{ deleted: boolean }>(`/admin/categories/${categoryId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["asset-categories"] });
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("카테고리와 연결 자산이 삭제되었습니다.");
    },
  });
}
