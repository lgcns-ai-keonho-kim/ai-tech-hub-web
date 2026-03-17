/**
 * 목적: 프로젝트 목록 화면의 검색 및 페이지네이션 동작을 검증한다.
 * 설명: 프로젝트 카드 노출 범위와 빈 결과 안내를 사용자가 바로 확인할 수 있게 보장한다.
 * 적용 패턴: 페이지 렌더링 테스트 패턴
 * 참조: ui/src/pages/projects-page.tsx, ui/src/shared/api/hooks.ts
 */
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as projectQueries from "@/entities/project/model/queries";
import { ProjectsPage } from "@/pages/projects/list/ui/page";
import { asQueryResult } from "@/test/react-query-mocks";
import { renderWithAppProviders } from "@/test/render-app";

vi.mock("@/entities/project/model/queries", () => ({
  useProjectsQuery: vi.fn(),
}));

const mockedUseProjectsQuery = vi.mocked(projectQueries.useProjectsQuery);

function createProjects(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `고객 상담 Copilot 구축 ${index + 1}`,
    slug: `customer-copilot-build-${index + 1}`,
    customerName: `미래컨택트센터 ${index + 1}`,
    summary: `상담 지원 챗봇 구축을 위한 요구사항과 운영 문서를 관리합니다. ${index + 1}`,
    managerNames: [`김하늘 ${index + 1}`, `이준호 ${index + 1}`],
    currentStage: "development" as const,
    stageCounts: {
      proposal: 1,
      analysis: 1,
      design: 1,
      development: 2,
      test: 0,
      operations: 0,
    },
    assetCounts: { knowledge: 5, troubleshooting: 1, lesson: 1 },
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => null);
  mockedUseProjectsQuery.mockReturnValue(asQueryResult<ReturnType<typeof projectQueries.useProjectsQuery>>({
    data: createProjects(7),
    isLoading: false,
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProjectsPage", () => {
  it("검색 입력에 고객사와 PM 검색 의도를 드러낸다", () => {
    renderWithAppProviders(<ProjectsPage />);

    expect(screen.getByPlaceholderText("프로젝트명, 고객사, PM 검색")).toBeInTheDocument();
  });

  it("입력 중에는 결과를 유지하고 검색 제출 후에만 결과를 바꾼다", async () => {
    const user = userEvent.setup();
    mockedUseProjectsQuery.mockImplementation((query?: string) => asQueryResult<ReturnType<typeof projectQueries.useProjectsQuery>>({
      data: query?.trim() === "7" ? [createProjects(7)[6]] : createProjects(7),
      isLoading: false,
    }));

    renderWithAppProviders(<ProjectsPage />);

    const input = screen.getByPlaceholderText("프로젝트명, 고객사, PM 검색");
    await user.type(input, "7");

    expect(screen.getByText(/검색 결과 7건 .*1-6건 표시/)).toBeInTheDocument();
    expect(screen.queryByText(/검색 결과 1건 .*1-1건 표시/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "검색" }));

    expect(screen.getByText(/검색 결과 1건 .*1-1건 표시/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /고객 상담 Copilot 구축 7/i })).toBeInTheDocument();
  });

  it("첫 페이지에는 6개 프로젝트만 보여주고 다음 페이지로 이동할 수 있다", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(<ProjectsPage />);

    expect(screen.getByText(/검색 결과 7건 .*1-6건 표시/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /고객 상담 Copilot 구축 1/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /고객 상담 Copilot 구축 7/i })).not.toBeInTheDocument();
    expect(await screen.findByRole("list", { name: "프로젝트 단계 요약" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText(/검색 결과 7건 .*7-7건 표시/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /고객 상담 Copilot 구축 7/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("검색 결과가 없으면 빈 상태 안내를 보여준다", () => {
    mockedUseProjectsQuery.mockReturnValue(asQueryResult<ReturnType<typeof projectQueries.useProjectsQuery>>({
      data: [],
      isLoading: false,
    }));

    renderWithAppProviders(<ProjectsPage />);

    expect(screen.getByText("조건에 맞는 프로젝트가 없습니다.")).toBeInTheDocument();
    expect(screen.getByText("표시할 프로젝트가 아직 없습니다.")).toBeInTheDocument();
  });
});
