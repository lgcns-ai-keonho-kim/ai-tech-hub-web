/**
 * 목적: 자산 목록 화면 검색 바의 순서와 반응형 폭 정책을 검증한다.
 * 설명: 비코드 자산에서는 프로젝트 검색이 먼저 노출되고, 코드 자산은 기존 검색 흐름을 유지하는지 확인한다.
 * 적용 패턴: 페이지 렌더링 테스트 패턴
 * 참조: ui/src/pages/asset-list-page.tsx, ui/src/shared/api/hooks.ts
 */
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as assetQueries from "@/entities/asset/model/queries";
import type { AssetSummary, PaginatedAssets } from "@/entities/asset/model/types";
import * as projectQueries from "@/entities/project/model/queries";
import { AssetListPage } from "@/pages/assets/list/ui/page";
import { asQueryResult } from "@/test/react-query-mocks";
import { renderWithAppProviders } from "@/test/render-app";

vi.mock("@/entities/asset/model/queries", () => ({
  useAssetCategoriesQuery: vi.fn(),
  usePaginatedAssetsQuery: vi.fn(),
}));

vi.mock("@/entities/project/model/queries", () => ({
  useProjectsQuery: vi.fn(),
}));

const mockedUseAssetCategoriesQuery = vi.mocked(assetQueries.useAssetCategoriesQuery);
const mockedUsePaginatedAssetsQuery = vi.mocked(assetQueries.usePaginatedAssetsQuery);
const mockedUseProjectsQuery = vi.mocked(projectQueries.useProjectsQuery);

beforeEach(() => {
  vi.clearAllMocks();
});

function renderAssetListPage({
  initialEntry = "/knowledge-assets",
  kind = "knowledge",
  paginatedAssets,
}: {
  initialEntry?: string;
  kind?: "code" | "knowledge" | "troubleshooting" | "lesson";
  paginatedAssets?: PaginatedAssets;
} = {}) {
  mockedUseAssetCategoriesQuery.mockReturnValue(asQueryResult<ReturnType<typeof assetQueries.useAssetCategoriesQuery>>({
    data: [
      {
        id: 1,
        kind,
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
  mockedUsePaginatedAssetsQuery.mockReturnValue(asQueryResult<ReturnType<typeof assetQueries.usePaginatedAssetsQuery>>({
    data: paginatedAssets ?? {
      assets: [],
      pagination: {
        page: 1,
        pageSize: 12,
        totalCount: 0,
        totalPages: 1,
      },
    },
    isLoading: false,
  }));

  return renderWithAppProviders(<AssetListPage kind={kind} />, {
    initialEntries: [initialEntry],
  });
}

function createAssetSummary(kind: "code" | "knowledge" | "troubleshooting" | "lesson"): AssetSummary {
  return {
    id: 1,
    kind,
    title: `${kind} 제목`,
    slug: `${kind}-slug`,
    summary: `${kind} 요약`,
    categoryId: 1,
    categoryName: "아키텍처",
    categorySlug: "architecture",
    projectId: 1,
    projectName: "에이전트 허브",
    ownerUserId: 7,
    ownerName: "김하늘",
    status: "approved",
    attachmentName: null,
    attachmentUrl: null,
    externalUrl: null,
    createdAt: "2026-03-16T00:00:00.000Z",
    updatedAt: "2026-03-16T00:00:00.000Z",
    approvedAt: "2026-03-16T00:00:00.000Z",
    ratingScore: 4.8,
    viewCount: 100,
    downloadCount: 50,
    likeCount: 20,
    favoriteCount: 10,
    likedByMe: false,
    favoritedByMe: false,
    downloadedByMe: false,
  };
}

describe("AssetListPage", () => {
  it("목록형 헤더를 새 순서로 렌더링하고 상태·설명 컬럼은 제거한다", () => {
    renderAssetListPage({
      paginatedAssets: {
        assets: [createAssetSummary("knowledge")],
        pagination: {
          page: 1,
          pageSize: 12,
          totalCount: 1,
          totalPages: 1,
        },
      },
    });

    const headers = screen.getAllByRole("columnheader").map((header) => header.textContent?.trim());

    expect(headers).toEqual(["프로젝트", "카테고리", "제목", "조회수", "다운로드", "작성 일자"]);
    expect(screen.queryByRole("columnheader", { name: "상태" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "설명" })).not.toBeInTheDocument();
  });

  it("비코드 자산에서는 프로젝트 검색이 일반 검색보다 먼저 렌더링되고 4.5:5.5 비율 클래스를 가진다", () => {
    renderAssetListPage();

    const projectInput = screen.getByPlaceholderText("프로젝트 검색");
    const queryInput = screen.getByPlaceholderText("제목, 요약, 작성자 기준 검색");
    const projectWrapper = screen.getByTestId("project-selector-root");

    expect(projectInput.compareDocumentPosition(queryInput) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(projectWrapper.className).toContain("lg:flex-[4.5]");
    expect(queryInput.className).toContain("lg:flex-[5.5]");
  });

  it("프로젝트가 선택된 상태에서 지우기를 누르면 프로젝트 검색 입력으로 되돌아간다", async () => {
    const user = userEvent.setup();

    renderAssetListPage({
      initialEntry: "/knowledge-assets?projectId=1",
    });

    await waitFor(() => {
      expect(
        screen.getByRole("status", { name: "선택된 프로젝트 에이전트 허브" }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "지우기" }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("프로젝트 검색")).toBeInTheDocument();
    });
  });

  it("코드 자산에서는 프로젝트 검색이 보이지 않고 기존 검색 입력이 전체 폭을 사용한다", () => {
    renderAssetListPage({
      initialEntry: "/code-assets",
      kind: "code",
    });

    const queryInput = screen.getByPlaceholderText("제목, 요약, 작성자 기준 검색");

    expect(screen.queryByPlaceholderText("프로젝트 검색")).not.toBeInTheDocument();
    expect(queryInput.className).toContain("lg:flex-1");
  });

  it("비코드 자산은 view 파라미터가 없을 때 목록형을 기본으로 사용한다", () => {
    renderAssetListPage({
      paginatedAssets: {
        assets: [createAssetSummary("knowledge")],
        pagination: {
          page: 1,
          pageSize: 12,
          totalCount: 1,
          totalPages: 1,
        },
      },
    });

    expect(screen.getByRole("columnheader", { name: "프로젝트" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "카테고리" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "설명" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /knowledge 제목/i })).toBeInTheDocument();
  });

  it("코드 자산은 view 파라미터가 없을 때 카드형을 기본으로 유지한다", () => {
    renderAssetListPage({
      initialEntry: "/code-assets",
      kind: "code",
      paginatedAssets: {
        assets: [createAssetSummary("code")],
        pagination: {
          page: 1,
          pageSize: 12,
          totalCount: 1,
          totalPages: 1,
        },
      },
    });

    expect(screen.queryByText("상태")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /code 제목/i })).toBeInTheDocument();
  });

  it("조회수와 다운로드 컬럼은 데스크톱 전용 클래스로 렌더링된다", () => {
    renderAssetListPage({
      paginatedAssets: {
        assets: [createAssetSummary("knowledge")],
        pagination: {
          page: 1,
          pageSize: 12,
          totalCount: 1,
          totalPages: 1,
        },
      },
    });

    expect(screen.getByRole("columnheader", { name: "조회수" }).className).toContain("hidden");
    expect(screen.getByRole("columnheader", { name: "조회수" }).className).toContain("lg:table-cell");
    expect(screen.getByRole("columnheader", { name: "다운로드" }).className).toContain("hidden");
    expect(screen.getByRole("columnheader", { name: "다운로드" }).className).toContain("lg:table-cell");
  });
});
