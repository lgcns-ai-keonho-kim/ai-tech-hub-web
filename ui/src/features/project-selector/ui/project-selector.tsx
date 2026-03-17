/**
 * 목적: 프로젝트 검색 선택기를 공용 피처로 제공한다.
 * 설명: 자산 목록과 자산 등록 화면이 동일한 프로젝트 탐색 상호작용을 재사용하도록 구성한다.
 * 적용 패턴: 제어 컴포넌트 패턴
 * 참조: ui/src/entities/project/model/queries.ts, ui/src/entities/asset/model/types.ts
 */
import { useDeferredValue, useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/primitives/badge";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { useProjectsQuery } from "@/entities/project/model/queries";
import type { ProjectSummary } from "@/entities/project/model/types";
import type { AssetKind } from "@/entities/asset/model/types";

type ProjectSelectorProps = {
  kind: AssetKind;
  selectedProject?: Pick<ProjectSummary, "id" | "name"> | null;
  onProjectSelect: (project: ProjectSummary) => void;
  onProjectClear: () => void;
  placeholder?: string;
  optionMeta?: (project: ProjectSummary) => string;
  className?: string;
};

export function ProjectSelector({
  kind,
  selectedProject,
  onProjectSelect,
  onProjectClear,
  placeholder = "프로젝트 검색",
  optionMeta,
  className,
}: ProjectSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const deferredQuery = useDeferredValue(query.trim());
  const projectsQuery = useProjectsQuery(kind === "code" ? undefined : deferredQuery || undefined);
  const projectOptions = (projectsQuery.data ?? []).slice(0, 6);
  const shouldShowResults = !selectedProject && open && query.trim().length > 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  if (kind === "code") {
    return null;
  }

  return (
    <div
      ref={fieldRef}
      className={cn("relative", className)}
      data-testid="project-selector-root"
    >
      {selectedProject ? (
        <div
          className="flex h-9 min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-background px-3"
          role="status"
          aria-label={`선택된 프로젝트 ${selectedProject.name}`}
        >
          <Badge
            variant="outline"
            className="min-w-0 flex-1 truncate rounded-md border-border bg-background px-3 py-1.5 text-foreground/90"
          >
            {selectedProject.name}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-md text-muted-foreground hover:text-foreground"
            onClick={onProjectClear}
          >
            지우기
          </Button>
        </div>
      ) : (
        <>
          <Input
            value={query}
            onChange={(event) => {
              const nextValue = event.target.value;
              setQuery(nextValue);
              setOpen(nextValue.trim().length > 0);
            }}
            onFocus={() => {
              if (query.trim()) {
                setOpen(true);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={shouldShowResults}
            aria-controls="project-selector-options"
            aria-label={placeholder}
            className="h-9 rounded-md border-border bg-background px-3"
          />
          {shouldShowResults ? (
            <div
              id="project-selector-options"
              role="listbox"
              className="surface-panel absolute top-[calc(100%+0.5rem)] z-20 w-full rounded-lg border border-border bg-background p-2"
            >
              {projectsQuery.isFetching ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">
                  프로젝트 후보를 불러오는 중입니다.
                </div>
              ) : projectOptions.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {projectOptions.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      role="option"
                      aria-selected={false}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                      onClick={() => {
                        setQuery("");
                        setOpen(false);
                        onProjectSelect(project);
                      }}
                    >
                      <span className="truncate text-foreground">{project.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {optionMeta?.(project) ?? ""}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-muted-foreground">
                  일치하는 프로젝트가 없습니다.
                </div>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
