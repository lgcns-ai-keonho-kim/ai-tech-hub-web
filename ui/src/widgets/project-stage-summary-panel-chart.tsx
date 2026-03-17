/**
 * 목적: 프로젝트 단계 차트 canvas와 Chart.js 드라이버를 연결한다.
 * 설명: 차트 설정과 등록 책임은 드라이버에 위임하고, 이 컴포넌트는 canvas 생명주기와 fallback 렌더링만 관리한다.
 * 적용 패턴: imperative bridge 패턴
 * 참조: ui/src/widgets/project-stage-summary-panel.tsx, ui/src/widgets/project-stage-summary-panel-chart-driver.ts
 */
import { useEffect, useRef, useState } from "react";

import {
  createProjectStageChart,
  destroyProjectStageChart,
  type ProjectStageChartInstance,
  type ProjectStageChartModel,
} from "@/widgets/project-stage-summary-panel-chart-driver";

function hasRenderableCanvasContext(canvas: HTMLCanvasElement) {
  try {
    return Boolean(canvas.getContext("2d"));
  } catch {
    return false;
  }
}

export function ProjectStageSummaryPanelChart({
  chartModel,
  chartThemeKey,
  className,
}: {
  chartModel: ProjectStageChartModel;
  chartThemeKey: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ProjectStageChartInstance | null>(null);
  const [shouldRenderFallback, setShouldRenderFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (!hasRenderableCanvasContext(canvas)) {
      setShouldRenderFallback(true);
      return;
    }

    setShouldRenderFallback(false);
    chartInstanceRef.current = createProjectStageChart(canvas, chartModel);

    return () => {
      destroyProjectStageChart(canvas, chartInstanceRef.current);
      chartInstanceRef.current = null;
    };
  }, [chartModel, chartThemeKey]);

  if (shouldRenderFallback) {
    return (
      <div
        className={className}
        role="list"
        aria-label="프로젝트 단계 요약"
      >
        <div className="grid h-full w-full grid-cols-2 gap-2 sm:grid-cols-3">
          {chartModel.items.map((item) => (
            <div
              key={item.label}
              role="listitem"
              className="surface-panel-muted flex min-h-20 flex-col justify-between rounded-lg border border-border px-3 py-2"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {item.label}
              </span>
              <span
                className="text-lg font-medium tabular-nums text-foreground"
                style={{ color: item.color }}
              >
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <canvas ref={canvasRef} aria-label="프로젝트 단계 차트" />
    </div>
  );
}
