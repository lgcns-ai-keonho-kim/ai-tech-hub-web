/**
 * 목적: 프로젝트 목록 화면을 렌더링한다.
 * 설명: 프로젝트 검색, 페이지네이션, 기본 요약 정보를 제공하고 상세 페이지 진입을 연결한다.
 * 적용 패턴: 목록 화면 패턴
 * 참조: ui/src/pages/projects/list/model/use-project-list-state.ts, ui/src/widgets/project-list/ui/project-list-card.tsx
 */
import { useEffect, useMemo } from "react";

import { Badge } from "@/shared/ui/primitives/badge";
import { Button } from "@/shared/ui/primitives/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/ui/primitives/empty";
import { Input } from "@/shared/ui/primitives/input";
import { cn } from "@/shared/lib/cn";
import { useProjectsQuery } from "@/entities/project/model/queries";
import { PageLoadingOverlay } from "@/shared/ui/page-loading-overlay";
import { SectionHero } from "@/shared/ui/section-hero";
import { useProjectListState } from "@/pages/projects/list/model/use-project-list-state";
import { ProjectListCard } from "@/widgets/project-list/ui/project-list-card";
import {
  ProjectStageSummaryPanel,
  summarizeProjectStages,
} from "@/widgets/project-stage-summary-panel";

const PROJECTS_PAGE_SIZE = 6;

function buildVisiblePageItems(page: number, totalPages: number) {
  const pages: Array<number | "ellipsis"> = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  if (start > 1) {
    pages.push(1);
  }
  if (start > 2) {
    pages.push("ellipsis");
  }
  for (let index = start; index <= end; index += 1) {
    pages.push(index);
  }
  if (end < totalPages - 1) {
    pages.push("ellipsis");
  }
  if (end < totalPages) {
    pages.push(totalPages);
  }

  return pages;
}

export function ProjectsPage() {
  const allProjectsQuery = useProjectsQuery();
  const queryState = useProjectListState();
  const currentPage = queryState.page;
  const setCurrentPage = queryState.setPage;
  const projectsQuery = useProjectsQuery(queryState.normalizedQuery || undefined);
  const { totalProjects, totalAssignedProjects } = useMemo(
    () => summarizeProjectStages(allProjectsQuery.data),
    [allProjectsQuery.data],
  );
  const filteredProjects = projectsQuery.data ?? [];
  const pagination = useMemo(() => {
    const totalCount = filteredProjects.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PROJECTS_PAGE_SIZE));
    const resolvedPage = Math.min(currentPage, totalPages);
    const startIndex = (resolvedPage - 1) * PROJECTS_PAGE_SIZE;
    const endIndex = Math.min(totalCount, startIndex + PROJECTS_PAGE_SIZE);

    return {
      page: resolvedPage,
      pageSize: PROJECTS_PAGE_SIZE,
      totalCount,
      totalPages,
      startIndex,
      endIndex,
    };
  }, [currentPage, filteredProjects]);
  const pagedProjects = useMemo(
    () => filteredProjects.slice(pagination.startIndex, pagination.endIndex),
    [filteredProjects, pagination.endIndex, pagination.startIndex],
  );
  const visiblePageItems = useMemo(
    () => buildVisiblePageItems(pagination.page, pagination.totalPages),
    [pagination.page, pagination.totalPages],
  );

  useEffect(() => {
    if (currentPage <= pagination.totalPages) {
      return;
    }

    setCurrentPage(pagination.totalPages);
  }, [currentPage, pagination.totalPages, setCurrentPage]);

  return (
    <div className="flex flex-col gap-6">
      {!projectsQuery.data && projectsQuery.isLoading ? (
        <PageLoadingOverlay message="프로젝트 목록을 불러오는 중입니다." />
      ) : null}

      <SectionHero
        eyebrow="프로젝트"
        title="프로젝트"
        description="참여 중인 프로젝트를 열어 문서와 기록을 확인하세요."
        meta={(
          <>
            <Badge variant="outline" className="rounded-md border-border bg-background">
              전체 프로젝트 {totalProjects}건
            </Badge>
            <Badge variant="outline" className="rounded-md border-border bg-background">
              단계 배정 프로젝트 {totalAssignedProjects}건
            </Badge>
          </>
        )}
        aside={(
          <ProjectStageSummaryPanel projects={allProjectsQuery.data} />
        )}
      />

      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={queryState.handleSearchSubmit}>
        <Input
          value={queryState.draftQuery}
          onChange={(event) => queryState.setDraftQuery(event.target.value)}
          onCompositionStart={() => queryState.setIsComposing(true)}
          onCompositionEnd={(event) => {
            queryState.setIsComposing(false);
            queryState.setDraftQuery(event.currentTarget.value);
          }}
          placeholder="프로젝트명, 고객사, PM 검색"
          className="h-9 rounded-md border-border bg-background px-3"
        />
        <Button type="submit" className="h-9 rounded-md px-4 sm:w-auto">
          검색
        </Button>
      </form>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <div>
          검색 결과 {pagination.totalCount}건
          {pagination.totalCount > 0
            ? ` · ${pagination.startIndex + 1}-${pagination.endIndex}건 표시`
            : ""}
        </div>
        <div>
          페이지 {pagination.page} / {pagination.totalPages}
        </div>
      </div>

      {pagedProjects.length > 0 ? (
        <div className="page-stagger-group flex flex-col gap-4">
          {pagedProjects.map((project) => (
            <ProjectListCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <Empty className="surface-panel rounded-lg border border-dashed border-border bg-background p-10">
          <EmptyHeader>
            <EmptyTitle>조건에 맞는 프로젝트가 없습니다.</EmptyTitle>
            <EmptyDescription>
              {queryState.normalizedQuery
                ? "프로젝트명, 고객사명, 프로젝트 매니저 이름을 다시 확인해 주세요."
                : "표시할 프로젝트가 아직 없습니다."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {pagination.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-border bg-background"
            disabled={pagination.page <= 1}
            onClick={() => queryState.setPage((currentPage) => Math.max(1, currentPage - 1))}
          >
            이전
          </Button>
          {visiblePageItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`project-page-ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={`project-page-${item}`}
                type="button"
                variant={item === pagination.page ? "default" : "outline"}
                className={cn(
                  "min-w-10 rounded-md",
                  item !== pagination.page && "border-border bg-background",
                )}
                onClick={() => queryState.setPage(item)}
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
              queryState.setPage((currentPage) =>
                Math.min(pagination.totalPages, currentPage + 1),
              )
            }
          >
            다음
          </Button>
        </div>
      ) : null}
    </div>
  );
}
