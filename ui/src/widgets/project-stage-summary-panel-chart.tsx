/**
 * 목적: 프로젝트 단계 차트 렌더링을 별도 청크로 분리한다.
 * 설명: chart.js와 react-chartjs-2 의존성을 실제 차트가 필요한 시점에만 로드해 번들 비용을 낮춘다.
 * 적용 패턴: 지연 로딩 패턴
 * 참조: ui/src/widgets/project-stage-summary-panel.tsx
 */
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

export function ProjectStageSummaryPanelChart({
  chartData,
  chartOptions,
  chartThemeKey,
  className,
}: {
  chartData: ChartData<"bar">;
  chartOptions: ChartOptions<"bar">;
  chartThemeKey: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Chart key={chartThemeKey} type="bar" data={chartData} options={chartOptions} />
    </div>
  );
}
