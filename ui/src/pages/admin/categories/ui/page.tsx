/**
 * 목적: 관리자 카테고리 생성 화면을 제공한다.
 * 설명: 자산 종류별 카테고리를 추가하고 현재 목록을 함께 보여준다.
 * 적용 패턴: 관리자 생성/목록 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/shared/constants/asset-domain.ts
 */
import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Input } from "@/shared/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/primitives/select";
import {
  useCategoryDeletePreviewMutation,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/admin-categories/model/mutations";
import { DeletePreviewPanel } from "@/features/admin-delete-preview/ui/delete-preview-panel";
import { assetKindOptions } from "@/entities/asset/lib/labels";
import { useAssetCategoriesQuery } from "@/entities/asset/model/queries";
import type { AssetCategory, AssetKind } from "@/entities/asset/model/types";
import { toSlug } from "@/shared/lib/slug";
import { SectionHero } from "@/shared/ui/section-hero";

export function AdminCategoriesPage() {
  const [kind, setKind] = useState<AssetKind>("knowledge");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("10");
  const categoriesQuery = useAssetCategoriesQuery(kind);
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const categoryPreviewMutation = useCategoryDeletePreviewMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("10");
  const [previewTarget, setPreviewTarget] = useState<AssetCategory | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AssetCategory | null>(null);

  useEffect(() => {
    if (!editingCategory) {
      return;
    }

    setEditName(editingCategory.name);
    setEditSortOrder(String(editingCategory.sortOrder));
  }, [editingCategory]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="Admin"
        title="카테고리 관리"
        description="자산 등록 시 사용하는 카테고리를 종류별로 관리합니다."
      />

      <Card className="surface-panel rounded-lg border-border bg-transparent">
        <CardHeader>
          <CardTitle>카테고리 추가</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={kind} onValueChange={(value) => setKind(value as AssetKind)}>
            <SelectTrigger className="h-9 rounded-md border-border bg-background">
              <SelectValue placeholder="자산 종류" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border bg-background">
              {assetKindOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="카테고리명" className="h-9 rounded-md border-border bg-background" />
          <Input value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} placeholder="정렬 순서" className="h-9 rounded-md border-border bg-background" />
          <Button
            type="button"
            className="rounded-md"
            disabled={createCategoryMutation.isPending || name.trim().length < 2}
            onClick={async () => {
              await createCategoryMutation.mutateAsync({
                kind,
                name,
                slug: toSlug(name),
                sortOrder: Number(sortOrder) || 10,
              });
              setName("");
            }}
          >
            {createCategoryMutation.isPending ? "추가 중..." : "카테고리 추가"}
          </Button>
        </CardContent>
      </Card>

      <div className="page-stagger-group grid gap-4 lg:grid-cols-2">
        {(categoriesQuery.data ?? []).map((category) => (
          <Card key={category.id} className="surface-panel rounded-lg border-border bg-transparent">
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>slug {category.slug} · sort {category.sortOrder}</div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="rounded-md border-border bg-background" onClick={() => setEditingCategory(category)}>
                  수정
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-md"
                  onClick={async () => {
                    await categoryPreviewMutation.mutateAsync(category.id);
                    setPreviewTarget(category);
                  }}
                >
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="max-w-2xl rounded-lg border-border bg-background">
          <DialogHeader>
            <DialogTitle>카테고리 수정</DialogTitle>
            <DialogDescription>이름과 정렬 순서를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={editName} onChange={(event) => setEditName(event.target.value)} className="h-9 rounded-md border-border bg-background" />
            <Input value={editSortOrder} onChange={(event) => setEditSortOrder(event.target.value)} className="h-9 rounded-md border-border bg-background" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-md border-border bg-background" onClick={() => setEditingCategory(null)}>
              취소
            </Button>
            <Button
              type="button"
              className="rounded-md"
              disabled={!editingCategory || updateCategoryMutation.isPending || editName.trim().length < 2}
              onClick={async () => {
                if (!editingCategory) {
                  return;
                }
                await updateCategoryMutation.mutateAsync({
                  categoryId: editingCategory.id,
                  input: {
                    kind: editingCategory.kind,
                    name: editName,
                    slug: toSlug(editName),
                    sortOrder: Number(editSortOrder) || editingCategory.sortOrder,
                  },
                });
                setEditingCategory(null);
              }}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewTarget)} onOpenChange={(open) => !open && setPreviewTarget(null)}>
        <DialogContent className="max-w-3xl rounded-lg border-border bg-background">
          <DialogHeader>
            <DialogTitle>1차 확인: 연결 자산 영향도</DialogTitle>
            <DialogDescription>
              이 카테고리에 연결된 자산은 함께 삭제됩니다. 먼저 영향을 확인해 주세요.
            </DialogDescription>
          </DialogHeader>
          {categoryPreviewMutation.data?.preview ? (
            <DeletePreviewPanel
              totalAssetCount={categoryPreviewMutation.data.preview.totalAssetCount}
              assetsByKind={categoryPreviewMutation.data.preview.assetsByKind}
            />
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-md border-border bg-background" onClick={() => setPreviewTarget(null)}>
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-md"
              disabled={!previewTarget}
              onClick={() => {
                setConfirmTarget(previewTarget);
                setPreviewTarget(null);
              }}
            >
              계속 삭제 진행
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(confirmTarget)} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <DialogContent className="max-w-2xl rounded-lg border-border bg-background">
          <DialogHeader>
            <DialogTitle>2차 확인: 관련 자산도 함께 삭제됩니다</DialogTitle>
            <DialogDescription>
              {confirmTarget?.name} 카테고리와 연결된 모든 자산이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-md border-border bg-background" onClick={() => setConfirmTarget(null)}>
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-md"
              disabled={!confirmTarget || deleteCategoryMutation.isPending}
              onClick={async () => {
                if (!confirmTarget) {
                  return;
                }
                await deleteCategoryMutation.mutateAsync(confirmTarget.id);
                setConfirmTarget(null);
              }}
            >
              {deleteCategoryMutation.isPending ? "삭제 중..." : "카테고리와 연결 자산 삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
