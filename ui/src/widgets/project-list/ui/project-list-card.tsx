/**
 * 목적: 프로젝트 목록 카드 위젯을 제공한다.
 * 설명: 프로젝트 페이지에서 반복되는 카드 표현을 위젯으로 분리해 페이지 책임을 줄인다.
 * 적용 패턴: 프레젠테이션 컴포넌트 패턴
 * 참조: ui/src/pages/projects/list/ui/page.tsx
 */
import { Link } from "react-router-dom";

import { Badge } from "@/shared/ui/primitives/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives/card";
import {
  getStageBadgeStyle,
  projectStageLabels,
  projectStageOrder,
} from "@/entities/project/lib/stage";
import type { ProjectSummary } from "@/entities/project/model/types";

export function ProjectListCard({ project }: { project: ProjectSummary }) {
  const totalStageFiles = projectStageOrder.reduce(
    (sum, stage) => sum + project.stageCounts[stage],
    0,
  );

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <Card className="surface-panel rounded-lg border-border bg-background transition-colors hover:bg-muted/40">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="min-w-0 truncate text-xl">{project.name}</CardTitle>
              {project.currentStage ? (
                <Badge
                  variant="outline"
                  style={getStageBadgeStyle(project.currentStage)}
                  className="shrink-0 rounded-md border-border bg-background"
                >
                  {projectStageLabels[project.currentStage]}
                </Badge>
              ) : null}
            </div>
            <div className="mt-3 text-[18px] leading-6 text-muted-foreground">
              {project.customerName}
            </div>
          </div>
          <div className="surface-panel-muted flex min-w-[260px] flex-col gap-2 rounded-lg border border-border p-4 text-sm">
            <div className="text-xs font-medium text-muted-foreground">프로젝트 매니저</div>
            <div className="text-lg text-foreground">
              {project.managerNames.join(", ") || "-"}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="max-w-4xl text-sm leading-6 text-muted-foreground">{project.summary}</p>
          </div>
          <div className="w-full max-w-[520px]">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>단계별 파일 수</span>
              <span>{totalStageFiles}건</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {projectStageOrder.map((stage) => (
                <div
                  key={`${project.id}-${stage}`}
                  className="surface-panel-muted rounded-lg border border-border px-3 py-2"
                >
                  <div className="text-xs font-medium text-muted-foreground">
                    {projectStageLabels[stage]}
                  </div>
                  <div className="mt-1 text-base text-foreground">{project.stageCounts[stage]}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
