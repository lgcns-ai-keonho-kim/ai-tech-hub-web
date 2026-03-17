/**
 * 목적: 자산 등록 폼의 프로젝트 검색 UI 통합 동작을 검증한다.
 * 설명: 프로젝트 검색 입력이 단일화되고, 선택과 해제가 기존 폼 값에 반영되는지 확인한다.
 * 적용 패턴: 페이지 렌더링 테스트 패턴
 * 참조: ui/src/pages/asset-form-page.tsx, ui/src/shared/api/hooks.ts
 */
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as assetQueries from "@/entities/asset/model/queries";
import type { AssetKind } from "@/entities/asset/model/types";
import * as createAssetMutations from "@/features/asset-actions/model/mutations";
import * as projectQueries from "@/entities/project/model/queries";
import { AssetFormPage } from "@/pages/assets/create/ui/page";
import { asMutationResult, asQueryResult } from "@/test/react-query-mocks";
import { renderWithAppProviders } from "@/test/render-app";

const mockedNavigate = vi.fn();
let mockedKind: AssetKind = "knowledge";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: () => ({ kind: mockedKind }),
  };
});

vi.mock("@/entities/asset/model/queries", () => ({
  useAssetCategoriesQuery: vi.fn(),
}));

vi.mock("@/features/asset-actions/model/mutations", () => ({
  useCreateAssetMutation: vi.fn(),
}));

vi.mock("@/entities/project/model/queries", () => ({
  useProjectsQuery: vi.fn(),
}));

const mockedUseAssetCategoriesQuery = vi.mocked(assetQueries.useAssetCategoriesQuery);
const mockedUseCreateAssetMutation = vi.mocked(createAssetMutations.useCreateAssetMutation);
const mockedUseProjectsQuery = vi.mocked(projectQueries.useProjectsQuery);

beforeEach(() => {
  vi.clearAllMocks();
  mockedKind = "knowledge";

  mockedUseAssetCategoriesQuery.mockReturnValue(asQueryResult<ReturnType<typeof assetQueries.useAssetCategoriesQuery>>({
    data: [
      {
        id: 1,
        kind: mockedKind,
        name: "아키텍처",
        slug: "architecture",
        sortOrder: 1,
      },
    ],
    isLoading: false,
  }));
  mockedUseProjectsQuery.mockReturnValue(asQueryResult<ReturnType<typeof projectQueries.useProjectsQuery>>({
    data: [
      {
        id: 1,
        name: "에이전트 허브",
        slug: "agent-hub",
        customerName: "한빛손해보험",
        summary: "프로젝트 요약",
        managerNames: ["김하늘"],
        currentStage: "design",
        stageCounts: {
          proposal: 1,
          analysis: 1,
          design: 1,
          development: 0,
          test: 0,
          operations: 0,
        },
        assetCounts: { knowledge: 3, troubleshooting: 1, lesson: 2 },
      },
    ],
    isLoading: false,
    isFetching: false,
  }));
  mockedUseCreateAssetMutation.mockReturnValue(asMutationResult<ReturnType<typeof createAssetMutations.useCreateAssetMutation>>({
    mutateAsync: vi.fn(),
    isPending: false,
  }));
});

describe("AssetFormPage", () => {
  it("slug 입력 UI는 숨기고 첨부파일 선택 UI를 노출한다", () => {
    renderWithAppProviders(<AssetFormPage />);

    expect(screen.queryByLabelText("slug")).not.toBeInTheDocument();
    expect(screen.getByLabelText("첨부파일")).toBeInTheDocument();
    expect(screen.queryByLabelText("첨부 이름")).not.toBeInTheDocument();
  });

  it("비코드 자산에서는 프로젝트 검색 입력을 하나만 렌더링한다", () => {
    renderWithAppProviders(<AssetFormPage />);

    expect(screen.getAllByPlaceholderText("프로젝트 검색")).toHaveLength(1);
  });

  it("프로젝트 후보를 선택하면 선택 상태와 지우기 버튼으로 전환된다", async () => {
    const user = userEvent.setup();

    renderWithAppProviders(<AssetFormPage />);

    await user.type(screen.getByPlaceholderText("프로젝트 검색"), "에이전트");
    await user.click(screen.getByRole("option", { name: /에이전트 허브/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("status", { name: "선택된 프로젝트 에이전트 허브" }),
      ).toBeInTheDocument();
    });
    expect(
      within(screen.getByRole("status", { name: "선택된 프로젝트 에이전트 허브" })).getByText("에이전트 허브"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지우기" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("프로젝트 검색")).not.toBeInTheDocument();
  });

  it("첨부파일을 선택하면 파일 미리보기와 지우기 버튼이 나타난다", async () => {
    const user = userEvent.setup();
    const file = new File(["mock content"], "requirements.pdf", { type: "application/pdf" });

    renderWithAppProviders(<AssetFormPage />);

    await user.upload(screen.getByLabelText("첨부파일"), file);

    expect(screen.getByText("requirements.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "지우기" })).toBeInTheDocument();
    expect(screen.getByText(/mock 미리보기만 저장되며/i)).toBeInTheDocument();
  });

  it("코드 자산에서는 프로젝트 검색 UI를 렌더링하지 않는다", () => {
    mockedKind = "code";
    mockedUseAssetCategoriesQuery.mockReturnValue(asQueryResult<ReturnType<typeof assetQueries.useAssetCategoriesQuery>>({
      data: [
        {
          id: 1,
          kind: "code",
          name: "코드 아키텍처",
          slug: "code-architecture",
          sortOrder: 1,
        },
      ],
      isLoading: false,
    }));

    renderWithAppProviders(<AssetFormPage />);

    expect(screen.queryByPlaceholderText("프로젝트 검색")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "지우기" })).not.toBeInTheDocument();
  });
});
