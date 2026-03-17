/**
 * 목적: 프로젝트 단계 차트의 Chart.js 인스턴스 정리 계약을 검증한다.
 * 설명: 같은 canvas가 재사용될 때 기존 차트를 먼저 파기해 개발 모드 재마운트 오류를 방지한다.
 * 적용 패턴: 위젯 라이프사이클 테스트 패턴
 * 참조: ui/src/widgets/project-stage-summary-panel-chart.tsx
 */
import { StrictMode } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockChartConstructor,
  mockChartRegister,
  mockGetChart,
  createdChartDestroyMocks,
  mockedBarController,
  mockedLineController,
  mockedCanvasContext,
} = vi.hoisted(() => ({
  mockChartConstructor: vi.fn(),
  mockChartRegister: vi.fn(),
  mockGetChart: vi.fn(),
  createdChartDestroyMocks: [] as Array<ReturnType<typeof vi.fn>>,
  mockedBarController: { id: "bar-controller" },
  mockedLineController: { id: "line-controller" },
  mockedCanvasContext: { id: "2d-context" },
}));

vi.mock("chart.js", () => {
  class MockChart {
    static register = mockChartRegister;
    static getChart = mockGetChart;
    destroy: ReturnType<typeof vi.fn>;

    constructor(canvas: HTMLCanvasElement, config: unknown) {
      this.destroy = vi.fn();
      createdChartDestroyMocks.push(this.destroy);
      mockChartConstructor(canvas, config);
    }
  }

  return {
    BarController: mockedBarController,
    BarElement: {},
    CategoryScale: {},
    Chart: MockChart,
    Legend: {},
    LineController: mockedLineController,
    LineElement: {},
    LinearScale: {},
    PointElement: {},
    Tooltip: {},
  };
});

import { ProjectStageSummaryPanelChart } from "@/widgets/project-stage-summary-panel-chart";

const chartModel = {
  items: [
    {
      label: "제안",
      count: 1,
      color: "#f59e0b",
    },
    {
      label: "분석",
      count: 2,
      color: "#0ea5e9",
    },
  ],
  theme: {
    axis: "#71717a",
    grid: "#e4e4e7",
    line: "#52525b",
    linePoint: "#18181b",
  },
};

describe("ProjectStageSummaryPanelChart", () => {
  beforeEach(() => {
    mockChartConstructor.mockReset();
    mockChartRegister.mockReset();
    mockGetChart.mockReset();
    createdChartDestroyMocks.length = 0;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => mockedCanvasContext as unknown as CanvasRenderingContext2D,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("기존 canvas 차트가 남아 있으면 새 차트를 만들기 전에 먼저 파기한다", async () => {
    const existingChartDestroy = vi.fn();
    mockGetChart.mockReturnValue({ destroy: existingChartDestroy });

    render(
      <StrictMode>
        <ProjectStageSummaryPanelChart
          chartModel={chartModel}
          chartThemeKey="light-grid-point"
        />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(mockChartConstructor).toHaveBeenCalled();
    });

    expect(mockChartRegister).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      mockedBarController,
      expect.any(Object),
      mockedLineController,
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
    );
    expect(existingChartDestroy).toHaveBeenCalled();
  });

  it("언마운트 시 현재 차트 인스턴스를 파기한다", async () => {
    mockGetChart.mockReturnValue(undefined);

    const { unmount } = render(
      <ProjectStageSummaryPanelChart
        chartModel={chartModel}
        chartThemeKey="light-grid-point"
      />,
    );

    await waitFor(() => {
      expect(mockChartConstructor).toHaveBeenCalledTimes(1);
    });

    unmount();

    expect(createdChartDestroyMocks[0]).toHaveBeenCalled();
  });

  it("canvas context를 얻지 못하면 정적 fallback 요약을 렌더링한다", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => null);

    render(
      <ProjectStageSummaryPanelChart
        chartModel={chartModel}
        chartThemeKey="light-grid-point"
      />,
    );

    expect(await screen.findByRole("list", { name: "프로젝트 단계 요약" })).toBeInTheDocument();
    expect(mockChartConstructor).not.toHaveBeenCalled();
  });
});
