/**
 * 목적: 자산 목록 화면을 종류별 공통 구조로 렌더링한다.
 * 설명: 검색, 정렬, 보기 모드, 카테고리/프로젝트 필터를 같은 화면 패턴으로 제공한다.
 * 적용 패턴: 공용 목록 화면 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/shared/constants/asset-domain.ts
 */
import { useDeferredValue, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { LayoutGrid, List } from "lucide-react";

import { Badge } from "@/shared/ui/primitives/badge";
import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import { Input } from "@/shared/ui/primitives/input";
import { cn } from "@/shared/lib/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/primitives/select";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/primitives/table";
import { ProjectSelector } from "@/features/project-selector/ui/project-selector";
import {
  useAssetCategoriesQuery,
  usePaginatedAssetsQuery,
} from "@/entities/asset/model/queries";
import type { AssetKind, AssetSort, AssetSummary, AssetViewMode } from "@/entities/asset/model/types";
import { useProjectsQuery } from "@/entities/project/model/queries";
import {
  assetSortOptions,
  getAssetKindLabel,
  getAssetStatusLabel,
} from "@/entities/asset/lib/labels";
import { getStageBadgeStyle, isStagePillTone } from "@/entities/project/lib/stage";
import { formatCompactNumber, formatDate } from "@/shared/lib/format";
import { PageLoadingOverlay } from "@/shared/ui/page-loading-overlay";
import { SectionHero } from "@/shared/ui/section-hero";

export function AssetListPage({
  kind,
  categorySlug,
}: {
  kind: AssetKind;
  categorySlug?: string;
}) {
  const pageSize = 12;
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = (searchParams.get("sort") as AssetSort) || "latest";
  const defaultView: AssetViewMode = kind === "code" ? "card" : "list";
  const view = (searchParams.get("view") as AssetViewMode) || defaultView;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const query = searchParams.get("query") ?? "";
  const categoryId = searchParams.get("categoryId");
  const rawProjectId = Number(searchParams.get("projectId") ?? "");
  const projectId = Number.isFinite(rawProjectId) && rawProjectId > 0 ? rawProjectId : undefined;
  const deferredQuery = useDeferredValue(query);
  const categoriesQuery = useAssetCategoriesQuery(kind);
  const allProjectsQuery = useProjectsQuery();
  const forcedCategory = useMemo(
    () => (categoriesQuery.data ?? []).find((item) => item.slug === categorySlug),
    [categoriesQuery.data, categorySlug],
  );
  const assetsQuery = usePaginatedAssetsQuery({
    kind,
    sort,
    query: deferredQuery || undefined,
    categoryId: forcedCategory?.id ?? (categoryId ? Number(categoryId) : undefined),
    projectId,
    page,
    pageSize,
  });

  const updateParams = (updater: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams);
    updater(next);
    setSearchParams(next);
  };

  const pagination = assetsQuery.data?.pagination;
  const visiblePageItems = useMemo(() => {
    if (!pagination) {
      return [];
    }

    const pages: Array<number | "ellipsis"> = [];
    const start = Math.max(1, pagination.page - 2);
    const end = Math.min(pagination.totalPages, pagination.page + 2);

    if (start > 1) {
      pages.push(1);
    }
    if (start > 2) {
      pages.push("ellipsis");
    }
    for (let index = start; index <= end; index += 1) {
      pages.push(index);
    }
    if (end < pagination.totalPages - 1) {
      pages.push("ellipsis");
    }
    if (end < pagination.totalPages) {
      pages.push(pagination.totalPages);
    }

    return pages;
  }, [pagination]);

  useEffect(() => {
    if (!pagination || page <= pagination.totalPages) {
      return;
    }

    updateParams((next) => {
      next.set("page", String(pagination.totalPages));
    });
  }, [page, pagination, searchParams]);

  const selectedProject = useMemo(() => {
    if (!projectId) {
      return null;
    }

    const matchedProject = (allProjectsQuery.data ?? []).find((project) => project.id === projectId);
    return matchedProject
      ? { id: matchedProject.id, name: matchedProject.name }
      : { id: projectId, name: `프로젝트 #${projectId}` };
  }, [allProjectsQuery.data, projectId]);
  const assetSearchInputClassName = cn(
    "h-9 rounded-md border-border bg-background px-3",
    kind === "code" ? "lg:flex-1" : "lg:min-w-0 lg:flex-[5.5]",
  );

  return (
    <div className="flex flex-col gap-6">
      {!assetsQuery.data && assetsQuery.isLoading ? (
        <PageLoadingOverlay message={`${getAssetKindLabel(kind)} 목록을 불러오는 중입니다.`} />
      ) : null}

      <SectionHero
        eyebrow={getAssetKindLabel(kind)}
        title={getAssetKindLabel(kind)}
        description={`${getAssetKindLabel(kind)} 목록입니다. 최신순, 평점순, 다운로드순 정렬과 카드/목록형 전환을 지원합니다.`}
        actions={(
          <Button asChild className="write-action-button rounded-md">
            <Link to={`/assets/new/${kind}`}>글쓰기</Link>
          </Button>
        )}
      />

      <section className="surface-panel rounded-lg p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Select
            value={forcedCategory ? String(forcedCategory.id) : (categoryId ?? "all")}
            onValueChange={(value) =>
              updateParams((next) => {
                if (value === "all") {
                  next.delete("categoryId");
                  next.delete("page");
                  return;
                }
                next.set("categoryId", value);
                next.delete("page");
              })
            }
          >
            <SelectTrigger className="h-9 rounded-md border-border bg-background sm:min-w-[190px]" disabled={Boolean(forcedCategory)}>
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border bg-background">
              <SelectItem value="all">카테고리 선택</SelectItem>
              {(categoriesQuery.data ?? []).map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {kind !== "code" ? (
            <ProjectSelector
              kind={kind}
              className="lg:min-w-0 lg:flex-[4.5]"
              selectedProject={selectedProject}
              optionMeta={(project) => `${project.assetCounts[kind] ?? 0}건`}
              onProjectSelect={(project) => {
                updateParams((next) => {
                  next.set("projectId", String(project.id));
                  next.delete("page");
                });
              }}
              onProjectClear={() => {
                updateParams((next) => {
                  next.delete("projectId");
                  next.delete("page");
                });
              }}
            />
          ) : null}
          <Input
            value={query}
            onChange={(event) =>
              updateParams((next) => {
                if (event.target.value) {
                  next.set("query", event.target.value);
                } else {
                  next.delete("query");
                }
                next.delete("page");
              })
            }
            placeholder="제목, 요약, 작성자 기준 검색"
            className={assetSearchInputClassName}
          />
          <div className="surface-panel-muted flex items-center gap-1 rounded-md border border-border p-1 lg:shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="카드형 보기"
              className={cn(
                "rounded-md border border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
                view === "card" && "border-primary/30 bg-primary/12 text-primary",
              )}
              onClick={() => updateParams((next) => next.set("view", "card"))}
            >
              <LayoutGrid strokeWidth={1.5} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="목록형 보기"
              className={cn(
                "rounded-md border border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
                view === "list" && "border-primary/30 bg-primary/12 text-primary",
              )}
              onClick={() => updateParams((next) => next.set("view", "list"))}
            >
              <List strokeWidth={1.5} />
            </Button>
          </div>
          <Select value={sort} onValueChange={(value) => updateParams((next) => {
            next.set("sort", value);
            next.delete("page");
          })}>
            <SelectTrigger className="h-9 rounded-md border-border bg-background sm:min-w-[160px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border bg-background">
              {assetSortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {!assetsQuery.data && assetsQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`asset-list-skeleton-${index}`} className="h-48 rounded-lg bg-muted/60" />
          ))}
        </div>
      ) : view === "card" ? (
        <div className="card-selection-grid page-stagger-group grid gap-4 lg:grid-cols-2">
          {(assetsQuery.data?.assets ?? []).map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <AssetListTable assets={assetsQuery.data?.assets ?? []} />
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-border bg-background"
            disabled={pagination.page <= 1}
            onClick={() =>
              updateParams((next) => {
                next.set("page", String(Math.max(1, pagination.page - 1)));
              })
            }
          >
            이전
          </Button>
          {visiblePageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={`page-${item}`}
                type="button"
                variant={item === pagination.page ? "default" : "outline"}
                className={cn(
                  "min-w-10 rounded-md",
                  item !== pagination.page && "border-border bg-background",
                )}
                onClick={() =>
                  updateParams((next) => {
                    next.set("page", String(item));
                  })
                }
              >
                {item}
              </Button>
            ),
          )}
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-border bg-background"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              updateParams((next) => {
                next.set("page", String(Math.min(pagination.totalPages, pagination.page + 1)));
              })
            }
          >
            다음
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function AssetListTable({ assets }: { assets: AssetSummary[] }) {
  return (
    <div className="surface-panel overflow-hidden rounded-lg border-border">
      <Table className="min-w-[700px] table-fixed lg:min-w-[940px]">
        <TableHeader>
          <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[20%] px-5 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground lg:w-[23%]">
              프로젝트
            </TableHead>
            <TableHead className="w-[12%] px-4 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground lg:w-[10%]">
              카테고리
            </TableHead>
            <TableHead className="w-[34%] px-4 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground lg:w-[33%]">
              제목
            </TableHead>
            <TableHead className="hidden px-3 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground lg:table-cell lg:w-[6%]">
              조회수
            </TableHead>
            <TableHead className="hidden px-3 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground lg:table-cell lg:w-[6%]">
              다운로드
            </TableHead>
            <TableHead className="w-[18%] px-5 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground lg:w-[14%]">
              작성 일자
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow
              key={asset.id}
              className="group/list-row border-border transition-[background-color] duration-150 ease-out hover:bg-accent/70 focus-within:bg-accent/70"
            >
              <TableCell className="w-[20%] px-5 py-4 text-left align-top lg:w-[23%]">
                <div className="min-w-0 whitespace-normal break-keep text-sm leading-6 text-foreground/90 transition-colors duration-150 ease-out group-hover/list-row:text-foreground group-focus-within/list-row:text-foreground">
                  {asset.projectName ?? "-"}
                </div>
              </TableCell>
              <TableCell className="w-[12%] px-4 py-4 text-left align-top lg:w-[10%]">
                <Badge
                  variant="outline"
                  style={asset.kind === "knowledge" && isStagePillTone(asset.categorySlug)
                    ? getStageBadgeStyle(asset.categorySlug)
                    : undefined}
                  className="rounded-md border-border bg-background transition-colors duration-150 ease-out group-hover/list-row:border-primary/30 group-focus-within/list-row:border-primary/30"
                >
                  {asset.categoryName}
                </Badge>
              </TableCell>
              <TableCell className="w-[34%] px-4 py-4 text-left align-top lg:w-[33%]">
                <Link
                  to={`/assets/${asset.id}`}
                  className="relative inline-block max-w-full truncate text-sm font-normal text-foreground transition-[color,transform] duration-150 ease-out after:absolute after:right-0 after:-bottom-0.5 after:left-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-150 after:ease-out hover:text-primary hover:after:scale-x-100 focus-visible:text-primary focus-visible:after:scale-x-100 group-hover/list-row:translate-x-0.5 group-focus-within/list-row:translate-x-0.5"
                >
                  {asset.title}
                </Link>
              </TableCell>
              <TableCell className="hidden px-3 py-4 text-left align-top text-sm text-foreground/90 transition-colors duration-150 ease-out group-hover/list-row:text-foreground lg:table-cell lg:w-[6%]">
                {formatCompactNumber(asset.viewCount)}
              </TableCell>
              <TableCell className="hidden px-3 py-4 text-left align-top text-sm text-foreground/90 transition-colors duration-150 ease-out group-hover/list-row:text-foreground lg:table-cell lg:w-[6%]">
                {formatCompactNumber(asset.downloadCount)}
              </TableCell>
              <TableCell className="w-[18%] px-5 py-4 text-left align-top text-sm text-muted-foreground transition-colors duration-150 ease-out group-hover/list-row:text-foreground/80 group-focus-within/list-row:text-foreground/80 lg:w-[14%]">
                {formatDate(asset.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetSummary }) {
  return (
    <Link to={`/assets/${asset.id}`} className="card-selection-item block">
      <Card className="surface-panel rounded-lg border-border bg-transparent transition-transform hover:-translate-y-1">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-md border-border bg-background">
              {getAssetStatusLabel(asset.status)}
            </Badge>
            <Badge
              variant="outline"
              style={asset.kind === "knowledge" && isStagePillTone(asset.categorySlug)
                ? getStageBadgeStyle(asset.categorySlug)
                : undefined}
              className="rounded-md border-border bg-background"
            >
              {asset.categoryName}
            </Badge>
            {asset.projectName ? (
              <Badge variant="outline" className="rounded-md border-border bg-background">
                {asset.projectName}
              </Badge>
            ) : null}
          </div>
          <CardTitle className="text-2xl tracking-[-0.04em]">{asset.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-7 text-muted-foreground">{asset.summary}</p>
          <div className="grid grid-cols-4 gap-3 text-sm text-muted-foreground">
            <div>
              <div className="text-xs uppercase tracking-[0.18em]">평점</div>
              <div className="mt-1 text-foreground">{asset.ratingScore.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em]">다운로드</div>
              <div className="mt-1 text-foreground">{formatCompactNumber(asset.downloadCount)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em]">좋아요</div>
              <div className="mt-1 text-foreground">{formatCompactNumber(asset.likeCount)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em]">등록일</div>
              <div className="mt-1 text-foreground">{formatDate(asset.createdAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
