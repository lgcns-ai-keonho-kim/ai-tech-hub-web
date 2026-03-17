/**
 * 목적: 자산 등록 공용 폼을 종류별로 렌더링한다.
 * 설명: 프로젝트 검색, 카테고리 선택, 본문 입력을 같은 구조에서 처리한다.
 * 적용 패턴: 공용 폼 화면 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/shared/constants/asset-domain.ts
 */
import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/shared/ui/primitives/badge";
import { Button } from "@/shared/ui/primitives/button";
import {
  FieldDescription,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/primitives/field";
import { Input } from "@/shared/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/primitives/select";
import { Textarea } from "@/shared/ui/primitives/textarea";
import { useAssetCategoriesQuery } from "@/entities/asset/model/queries";
import type { AssetKind, CreateAssetInput } from "@/entities/asset/model/types";
import { getAssetKindLabel } from "@/entities/asset/lib/labels";
import { useCreateAssetMutation } from "@/features/asset-actions/model/mutations";
import { ProjectSelector } from "@/features/project-selector/ui/project-selector";
import { toSlug } from "@/shared/lib/slug";
import { SectionHero } from "@/shared/ui/section-hero";

const assetSchema = z.object({
  title: z.string().trim().min(2, "제목은 2자 이상이어야 합니다."),
  slug: z
    .string()
    .trim()
    .min(2, "slug는 2자 이상이어야 합니다.")
    .regex(/^[a-z0-9-]+$/, "slug는 소문자, 숫자, 하이픈만 허용합니다."),
  summary: z.string().trim().min(10, "요약은 10자 이상이어야 합니다."),
  content: z.string().trim().min(20, "본문은 20자 이상이어야 합니다."),
  categoryId: z.coerce.number().int().positive("카테고리를 선택해 주세요."),
  projectId: z.coerce.number().int().positive().nullable(),
  attachmentName: z.string().trim().optional(),
  attachmentUrl: z.string().trim().optional(),
  externalUrl: z.string().trim().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

export function AssetFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const kind = params.kind as AssetKind;
  const categoriesQuery = useAssetCategoriesQuery(kind);
  const createAssetMutation = useCreateAssetMutation();
  const [selectedAttachmentFile, setSelectedAttachmentFile] = useState<File | null>(null);
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      content: "",
      categoryId: 0,
      projectId: null,
      attachmentName: "",
      attachmentUrl: "",
      externalUrl: "",
    },
  });

  const watchedTitle = form.watch("title");
  const selectedProjectId = form.watch("projectId");

  useEffect(() => {
    form.setValue("slug", toSlug(watchedTitle), { shouldValidate: true });
  }, [form, watchedTitle]);

  const requiresProject = kind !== "code";

  const handleProjectSelect = (projectId: number) => {
    form.setValue("projectId", projectId, { shouldValidate: true });
    form.clearErrors("projectId");
  };

  const handleProjectClear = () => {
    form.setValue("projectId", null, { shouldValidate: true });
  };

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setSelectedAttachmentFile(file);
    form.setValue("attachmentName", file?.name ?? "", { shouldValidate: true });
    form.setValue("attachmentUrl", "", { shouldValidate: true });
  };

  const handleAttachmentClear = () => {
    setSelectedAttachmentFile(null);
    setAttachmentInputKey((current) => current + 1);
    form.setValue("attachmentName", "", { shouldValidate: true });
    form.setValue("attachmentUrl", "", { shouldValidate: true });
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(async (values) => {
        if (requiresProject && !values.projectId) {
          form.setError("projectId", {
            message: "프로젝트를 선택해 주세요.",
          });
          return;
        }

        const payload: CreateAssetInput = {
          kind,
          title: values.title.trim(),
          slug: values.slug.trim(),
          summary: values.summary.trim(),
          content: values.content.trim(),
          categoryId: values.categoryId,
          projectId: values.projectId,
          attachmentName: values.attachmentName?.trim() || null,
          attachmentUrl: values.attachmentUrl?.trim() || null,
          externalUrl: values.externalUrl?.trim() || null,
        };
        const response = await createAssetMutation.mutateAsync(payload);
        navigate(`/assets/${response.asset.id}`);
      })}
    >
      <SectionHero
        eyebrow="자산 등록"
        title={`${getAssetKindLabel(kind)} 등록`}
        description="필요한 정보를 입력하고 저장하세요."
      />

      <section className="page-stagger-group grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="surface-panel rounded-lg p-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="asset-title">제목</FieldLabel>
                <Input id="asset-title" {...form.register("title")} className="h-9 rounded-md border-border bg-background" />
                <FieldError>{form.formState.errors.title?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="asset-summary">요약</FieldLabel>
                <Textarea id="asset-summary" {...form.register("summary")} className="min-h-28 rounded-lg border-border bg-background" />
                <FieldError>{form.formState.errors.summary?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="asset-content">본문</FieldLabel>
                <Textarea id="asset-content" {...form.register("content")} className="min-h-[380px] rounded-lg border-border bg-background" />
                <FieldError>{form.formState.errors.content?.message}</FieldError>
              </Field>
            </FieldGroup>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel rounded-lg p-6">
            <FieldGroup>
              <Field>
                <FieldLabel>카테고리</FieldLabel>
                <Select
                  value={form.watch("categoryId") ? String(form.watch("categoryId")) : ""}
                  onValueChange={(value) => form.setValue("categoryId", Number(value), { shouldValidate: true })}
                >
                  <SelectTrigger className="h-9 rounded-md border-border bg-background">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border bg-background">
                    {(categoriesQuery.data ?? []).map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError>{form.formState.errors.categoryId?.message}</FieldError>
              </Field>
              {requiresProject ? (
                <Field>
                  <FieldLabel htmlFor="project-query">프로젝트 검색</FieldLabel>
                  <ProjectSelector
                    kind={kind}
                    selectedProjectId={selectedProjectId}
                    selectedLabel={selectedProjectId ? `프로젝트 #${selectedProjectId}` : null}
                    optionMeta={(project) => `${project.assetCounts[kind] ?? 0}건`}
                    onProjectSelect={(project) => handleProjectSelect(project.id)}
                    onProjectClear={handleProjectClear}
                  />
                  <FieldError>{form.formState.errors.projectId?.message}</FieldError>
                </Field>
              ) : null}
              <Field>
                <FieldLabel htmlFor="attachment-file">첨부파일</FieldLabel>
                <Input
                  key={attachmentInputKey}
                  id="attachment-file"
                  type="file"
                  onChange={handleAttachmentChange}
                  className="h-9 rounded-md border-border bg-background file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:text-foreground"
                />
                <FieldDescription>
                  현재는 mock 미리보기만 저장되며, 다운로드 연결은 아직 지원하지 않습니다.
                </FieldDescription>
                {selectedAttachmentFile ? (
                  <div className="surface-panel-muted flex items-center justify-between gap-3 rounded-lg border border-border p-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-foreground">{selectedAttachmentFile.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {(selectedAttachmentFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-md text-muted-foreground hover:text-foreground"
                      onClick={handleAttachmentClear}
                    >
                      지우기
                    </Button>
                  </div>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="external-url">외부 링크</FieldLabel>
                <Input id="external-url" {...form.register("externalUrl")} className="h-9 rounded-md border-border bg-background" />
              </Field>
            </FieldGroup>
          </div>

          <div className="surface-panel-muted rounded-lg p-5">
            <div className="text-sm leading-7 text-muted-foreground">
              저장 후 상태는 내 자산에서 확인할 수 있습니다.
            </div>
            <Button type="submit" className="mt-4 w-full rounded-md" disabled={createAssetMutation.isPending}>
              {createAssetMutation.isPending ? "저장 중..." : "등록하기"}
            </Button>
          </div>
        </div>
      </section>
      <input type="hidden" {...form.register("slug")} />
      <input type="hidden" {...form.register("attachmentName")} />
      <input type="hidden" {...form.register("attachmentUrl")} />
    </form>
  );
}
