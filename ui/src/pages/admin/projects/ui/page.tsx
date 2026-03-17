/**
 * 목적: 관리자 프로젝트 생성 화면을 제공한다.
 * 설명: 최소 입력으로 프로젝트를 생성하고 현재 목록을 함께 보여준다.
 * 적용 패턴: 관리자 생성/목록 패턴
 * 참조: ui/src/shared/api/hooks.ts
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useProjectDeletePreviewMutation,
  useUpdateProjectMutation,
} from "@/features/admin-projects/model/mutations";
import { DeletePreviewPanel } from "@/features/admin-delete-preview/ui/delete-preview-panel";
import { useProjectsQuery } from "@/entities/project/model/queries";
import type { ProjectSummary } from "@/entities/project/model/types";
import { toSlug } from "@/shared/lib/slug";
import { SectionHero } from "@/shared/ui/section-hero";

export function AdminProjectsPage() {
  const projectsQuery = useProjectsQuery();
  const createProjectMutation = useCreateProjectMutation();
  const updateProjectMutation = useUpdateProjectMutation();
  const projectPreviewMutation = useProjectDeletePreviewMutation();
  const deleteProjectMutation = useDeleteProjectMutation();
  const [name, setName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [summary, setSummary] = useState("");
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null);
  const [editName, setEditName] = useState("");
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [previewTarget, setPreviewTarget] = useState<ProjectSummary | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ProjectSummary | null>(null);

  useEffect(() => {
    if (!editingProject) {
      return;
    }

    setEditName(editingProject.name);
    setEditCustomerName(editingProject.customerName);
    setEditSummary(editingProject.summary);
  }, [editingProject]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="Admin"
        title="프로젝트 관리"
        description="프로젝트를 추가하고 수정하거나 정리할 수 있습니다."
      />

      <Card className="surface-panel rounded-lg border-border bg-transparent">
        <CardHeader>
          <CardTitle>새 프로젝트 등록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="프로젝트명" className="h-9 rounded-md border-border bg-background" />
          <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="고객사명" className="h-9 rounded-md border-border bg-background" />
          <Input value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="프로젝트 요약" className="h-9 rounded-md border-border bg-background" />
          <Button
            type="button"
            className="rounded-md"
            disabled={createProjectMutation.isPending || name.trim().length < 2 || customerName.trim().length < 2 || summary.trim().length < 5}
            onClick={async () => {
              await createProjectMutation.mutateAsync({
                name,
                slug: toSlug(name),
                customerName,
                summary,
              });
              setName("");
              setCustomerName("");
              setSummary("");
            }}
          >
            {createProjectMutation.isPending ? "생성 중..." : "프로젝트 생성"}
          </Button>
        </CardContent>
      </Card>

      <div className="page-stagger-group grid gap-4 lg:grid-cols-2">
        {(projectsQuery.data ?? []).map((project) => (
          <Card key={project.id} className="surface-panel rounded-lg border-border bg-transparent">
            <CardHeader>
              <CardTitle>
                <Link to={`/projects/${project.id}`}>{project.name}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>{project.summary}</div>
              <div>고객사 {project.customerName}</div>
              <div>매니저 {project.managerNames.join(", ") || "-"}</div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="rounded-md border-border bg-background" onClick={() => setEditingProject(project)}>
                  수정
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-md"
                  onClick={async () => {
                    await projectPreviewMutation.mutateAsync(project.id);
                    setPreviewTarget(project);
                  }}
                >
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(editingProject)} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-w-2xl rounded-lg border-border bg-background">
          <DialogHeader>
            <DialogTitle>프로젝트 수정</DialogTitle>
            <DialogDescription>프로젝트명, 고객사명, 요약을 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={editName} onChange={(event) => setEditName(event.target.value)} className="h-9 rounded-md border-border bg-background" />
            <Input value={editCustomerName} onChange={(event) => setEditCustomerName(event.target.value)} className="h-9 rounded-md border-border bg-background" />
            <Input value={editSummary} onChange={(event) => setEditSummary(event.target.value)} className="h-9 rounded-md border-border bg-background" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-md border-border bg-background" onClick={() => setEditingProject(null)}>
              취소
            </Button>
            <Button
              type="button"
              className="rounded-md"
              disabled={!editingProject || updateProjectMutation.isPending || editName.trim().length < 2 || editCustomerName.trim().length < 2 || editSummary.trim().length < 5}
              onClick={async () => {
                if (!editingProject) {
                  return;
                }
                await updateProjectMutation.mutateAsync({
                  projectId: editingProject.id,
                  input: {
                    name: editName,
                    slug: toSlug(editName),
                    customerName: editCustomerName,
                    summary: editSummary,
                  },
                });
                setEditingProject(null);
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
              연결된 자산은 프로젝트와 함께 삭제됩니다. 먼저 영향을 확인해 주세요.
            </DialogDescription>
          </DialogHeader>
          {projectPreviewMutation.data?.preview ? (
            <DeletePreviewPanel
              totalAssetCount={projectPreviewMutation.data.preview.totalAssetCount}
              assetsByKind={projectPreviewMutation.data.preview.assetsByKind}
              assetsByCategory={projectPreviewMutation.data.preview.assetsByCategory}
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
              {confirmTarget?.name} 프로젝트와 연결된 모든 자산이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
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
              disabled={!confirmTarget || deleteProjectMutation.isPending}
              onClick={async () => {
                if (!confirmTarget) {
                  return;
                }
                await deleteProjectMutation.mutateAsync(confirmTarget.id);
                setConfirmTarget(null);
              }}
            >
              {deleteProjectMutation.isPending ? "삭제 중..." : "프로젝트와 연결 자산 삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
