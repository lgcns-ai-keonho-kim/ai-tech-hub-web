/**
 * 목적: 프로젝트 단계 통계 차트와 보조 요약 카드를 공용 패널로 제공한다.
 * 설명: 프로젝트 페이지와 홈 화면이 같은 차트 구성과 단계 집계를 재사용하며 차트 청크는 지연 로딩한다.
 * 적용 패턴: 프레젠테이션 컴포넌트 패턴
 * 참조: ui/src/pages/projects-page.tsx, ui/src/pages/home-page.tsx, ui/src/widgets/project-stage-summary-panel-chart.tsx
 */
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

import type { ChartData, ChartOptions } from "chart.js";
import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives/card";
import { cn } from "@/shared/lib/cn";
import { projectStageLabels, projectStageOrder } from "@/entities/project/lib/stage";
import type { ProjectStage, ProjectSummary } from "@/entities/project/model/types";
import { AnimatedSlotNumber } from "@/shared/ui/animated-slot-number";

const LazyProjectStageSummaryPanelChart = lazy(async () => {
  const module = await import("@/widgets/project-stage-summary-panel-chart");
  return { default: module.ProjectStageSummaryPanelChart };
});

type ProjectStageChartColors = {
  axis: string;
  grid: string;
  line: string;
  linePoint: string;
  stagePalette: string[];
};

const fallbackChartColors: ProjectStageChartColors = {
  axis: "#71717a",
  grid: "#e4e4e7",
  line: "#52525b",
  linePoint: "#18181b",
  stagePalette: ["#f59e0b", "#0ea5e9", "#8b5cf6", "#22c55e", "#ef4444", "#64748b"],
};

function readProjectStageChartColors(): ProjectStageChartColors {
  if (typeof document === "undefined") {
    return fallbackChartColors;
  }

  const styles = getComputedStyle(document.documentElement);

  return {
    axis: styles.getPropertyValue("--chart-axis").trim() || fallbackChartColors.axis,
    grid: styles.getPropertyValue("--chart-grid").trim() || fallbackChartColors.grid,
    line: styles.getPropertyValue("--chart-line").trim() || fallbackChartColors.line,
    linePoint: styles.getPropertyValue("--chart-line-point").trim() || fallbackChartColors.linePoint,
    stagePalette: [
      styles.getPropertyValue("--chart-stage-1").trim() || fallbackChartColors.stagePalette[0],
      styles.getPropertyValue("--chart-stage-2").trim() || fallbackChartColors.stagePalette[1],
      styles.getPropertyValue("--chart-stage-3").trim() || fallbackChartColors.stagePalette[2],
      styles.getPropertyValue("--chart-stage-4").trim() || fallbackChartColors.stagePalette[3],
      styles.getPropertyValue("--chart-stage-5").trim() || fallbackChartColors.stagePalette[4],
      styles.getPropertyValue("--chart-stage-6").trim() || fallbackChartColors.stagePalette[5],
    ],
  };
}

export function summarizeProjectStages(projects?: ProjectSummary[]) {
  const safeProjects = projects ?? [];
  const stageSummary = projectStageOrder.reduce<Record<ProjectStage, number>>((accumulator, stage) => {
    accumulator[stage] = safeProjects.filter((project) => project.currentStage === stage).length;
    return accumulator;
  }, {
    proposal: 0,
    analysis: 0,
    design: 0,
    development: 0,
    test: 0,
    operations: 0,
  });
  const totalProjects = safeProjects.length;
  const totalAssignedProjects = projectStageOrder.reduce(
    (sum, stage) => sum + stageSummary[stage],
    0,
  );

  return {
    stageSummary,
    totalProjects,
    totalAssignedProjects,
  };
}

export function ProjectStageSummaryPanel({
  projects,
  className,
  chartContainerClassName,
}: {
  projects?: ProjectSummary[];
  className?: string;
  chartContainerClassName?: string;
}) {
  const { resolvedTheme } = useTheme();
  const { stageSummary, totalProjects } = useMemo(
    () => summarizeProjectStages(projects),
    [projects],
  );
  const [chartColors, setChartColors] = useState<ProjectStageChartColors>(() => readProjectStageChartColors());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frameId = 0;
    frameId = window.requestAnimationFrame(() => {
      setChartColors(readProjectStageChartColors());
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [resolvedTheme]);

  const chartThemeKey = useMemo(
    () => `${resolvedTheme ?? "light"}-${chartColors.grid}-${chartColors.linePoint}`,
    [chartColors.grid, chartColors.linePoint, resolvedTheme],
  );
  const stageChartData = useMemo<ChartData<"bar">>(
    () => ({
      labels: projectStageOrder.map((stage) => projectStageLabels[stage]),
      datasets: [
        {
          type: "bar" as const,
          label: "단계별 파일 수",
          data: projectStageOrder.map((stage) => stageSummary[stage]),
          backgroundColor: chartColors.stagePalette,
          hoverBackgroundColor: chartColors.stagePalette,
          borderRadius: 6,
          borderSkipped: false as const,
          maxBarThickness: 36,
          categoryPercentage: 0.72,
          barPercentage: 0.88,
          order: 2,
          yAxisID: "y",
        },
        {
          type: "line" as const,
          label: "증감 흐름",
          data: projectStageOrder.map((stage) => stageSummary[stage]),
          borderColor: chartColors.line,
          borderWidth: 2,
          pointBackgroundColor: chartColors.linePoint,
          pointBorderColor: chartColors.linePoint,
          pointBorderWidth: 2,
          pointHoverBackgroundColor: chartColors.linePoint,
          pointHoverBorderColor: chartColors.linePoint,
          pointHoverRadius: 4.5,
          pointRadius: 4.5,
          tension: 0.25,
          order: 1,
          yAxisID: "y",
        },
      ],
    }),
    [chartColors.line, chartColors.linePoint, chartColors.stagePalette, stageSummary],
  );
  const stageChartOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      animation: {
        duration: 150,
        easing: "easeOutQuad",
      },
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      scales: {
        x: {
          border: {
            display: false,
          },
          grid: {
            display: false,
            drawTicks: false,
          },
          offset: true,
          ticks: {
            color: chartColors.axis,
            font: {
              family: "system-ui, sans-serif",
              size: 14,
              weight: 500,
            },
            maxRotation: 0,
            minRotation: 0,
            padding: 8,
          },
        },
        y: {
          beginAtZero: true,
          border: {
            display: false,
          },
          grid: {
            color: chartColors.grid,
            drawTicks: false,
          },
          ticks: {
            color: chartColors.axis,
            font: {
              family: "system-ui, sans-serif",
              size: 13,
              weight: 500,
            },
            precision: 0,
            stepSize: 1,
          },
        },
      },
    }),
    [chartColors],
  );

  return (
    <Card className={cn("surface-panel rounded-lg border-border bg-background", className)}>
      <CardHeader className="select-none items-center gap-2 pb-3 text-center">
        <CardTitle className="pl-[0.3em] text-lg font-bold tracking-[0.3em]">
          프로젝트 현황
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div className="select-none flex flex-col items-center justify-center gap-2 pb-1 text-center">
          <AnimatedSlotNumber
            value={totalProjects}
            format={(currentValue) => `${currentValue}개의 프로젝트 진행 중`}
            className="text-lg font-medium tabular-nums text-foreground"
            startWhenVisible
          />
        </div>
        <div className={cn("h-64 w-[75%] self-center", chartContainerClassName)}>
          <Suspense fallback={<div className="h-full w-full animate-pulse rounded-lg bg-muted/40" />}>
            <LazyProjectStageSummaryPanelChart
              chartThemeKey={chartThemeKey}
              chartData={stageChartData}
              chartOptions={stageChartOptions}
              className="h-full w-full"
            />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}
