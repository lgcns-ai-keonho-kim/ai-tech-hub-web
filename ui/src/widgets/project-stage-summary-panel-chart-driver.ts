/**
 * 목적: 프로젝트 단계 차트의 Chart.js 등록과 인스턴스 생성을 전담한다.
 * 설명: mixed chart에 필요한 controller/element/plugin 등록을 한 곳에 모아 런타임 오류와 중복 초기화를 방지한다.
 * 적용 패턴: 드라이버 패턴
 * 참조: ui/src/widgets/project-stage-summary-panel.tsx, ui/src/widgets/project-stage-summary-panel-chart.tsx
 */
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartConfigurationCustomTypesPerDataset,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

export type ProjectStageChartTheme = {
  axis: string;
  grid: string;
  line: string;
  linePoint: string;
};

export type ProjectStageChartItem = {
  label: string;
  count: number;
  color: string;
};

export type ProjectStageChartModel = {
  items: ProjectStageChartItem[];
  theme: ProjectStageChartTheme;
};

export type ProjectStageChartInstance = ChartJS<"bar" | "line", number[], string>;

let hasRegisteredProjectStageChart = false;

function ensureProjectStageChartRegistered() {
  if (hasRegisteredProjectStageChart) {
    return;
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
  );
  hasRegisteredProjectStageChart = true;
}

function buildProjectStageChartConfig(
  chartModel: ProjectStageChartModel,
): ChartConfigurationCustomTypesPerDataset<"bar" | "line", number[], string> {
  const labels = chartModel.items.map((item) => item.label);
  const counts = chartModel.items.map((item) => item.count);
  const stagePalette = chartModel.items.map((item) => item.color);

  return {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "단계별 파일 수",
          data: counts,
          backgroundColor: stagePalette,
          hoverBackgroundColor: stagePalette,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 36,
          categoryPercentage: 0.72,
          barPercentage: 0.88,
          order: 2,
          yAxisID: "y",
        },
        {
          type: "line",
          label: "증감 흐름",
          data: counts,
          borderColor: chartModel.theme.line,
          borderWidth: 2,
          pointBackgroundColor: chartModel.theme.linePoint,
          pointBorderColor: chartModel.theme.linePoint,
          pointBorderWidth: 2,
          pointHoverBackgroundColor: chartModel.theme.linePoint,
          pointHoverBorderColor: chartModel.theme.linePoint,
          pointHoverRadius: 4.5,
          pointRadius: 4.5,
          tension: 0.25,
          order: 1,
          yAxisID: "y",
        },
      ],
    },
    options: {
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
            color: chartModel.theme.axis,
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
            color: chartModel.theme.grid,
            drawTicks: false,
          },
          ticks: {
            color: chartModel.theme.axis,
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
    },
  };
}

export function createProjectStageChart(
  canvas: HTMLCanvasElement,
  chartModel: ProjectStageChartModel,
): ProjectStageChartInstance {
  ensureProjectStageChartRegistered();
  ChartJS.getChart(canvas)?.destroy();
  return new ChartJS(canvas, buildProjectStageChartConfig(chartModel));
}

export function destroyProjectStageChart(
  canvas: HTMLCanvasElement,
  chartInstance: ProjectStageChartInstance | null,
) {
  const registeredChart = ChartJS.getChart(canvas);

  if (registeredChart) {
    registeredChart.destroy();
    return;
  }

  chartInstance?.destroy();
}
