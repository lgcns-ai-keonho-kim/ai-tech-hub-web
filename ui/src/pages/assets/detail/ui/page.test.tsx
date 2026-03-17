/**
 * 목적: 자산 상세 화면의 첨부 메타 정보 노출 규칙을 검증한다.
 * 설명: attachmentName만 있는 mock 첨부도 화면에 보이고 다운로드 버튼은 비활성화되는지 확인한다.
 * 적용 패턴: 페이지 렌더링 테스트 패턴
 * 참조: ui/src/pages/asset-detail-page.tsx, ui/src/shared/api/hooks.ts
 */
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as assetQueries from "@/entities/asset/model/queries";
import * as assetMutations from "@/features/asset-actions/model/mutations";
import { AssetDetailPage } from "@/pages/assets/detail/ui/page";
import { asMutationResult, asQueryResult } from "@/test/react-query-mocks";
import { renderWithAppProviders } from "@/test/render-app";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useParams: () => ({ assetId: "1" }),
  };
});

vi.mock("@/entities/asset/model/queries", () => ({
  useAssetDetailQuery: vi.fn(),
  useAssetCommentsQuery: vi.fn(),
}));

vi.mock("@/features/asset-actions/model/mutations", () => ({
  useCreateAssetCommentMutation: vi.fn(),
  useDownloadAssetMutation: vi.fn(),
  useFavoriteAssetMutation: vi.fn(),
  useLikeAssetMutation: vi.fn(),
}));

vi.mock("@/entities/session/model/store", () => ({
  useAuthStore: vi.fn(() => null),
}));

const mockedUseAssetDetailQuery = vi.mocked(assetQueries.useAssetDetailQuery);
const mockedUseAssetCommentsQuery = vi.mocked(assetQueries.useAssetCommentsQuery);
const mockedUseCreateAssetCommentMutation = vi.mocked(assetMutations.useCreateAssetCommentMutation);
const mockedUseDownloadAssetMutation = vi.mocked(assetMutations.useDownloadAssetMutation);
const mockedUseFavoriteAssetMutation = vi.mocked(assetMutations.useFavoriteAssetMutation);
const mockedUseLikeAssetMutation = vi.mocked(assetMutations.useLikeAssetMutation);

beforeEach(() => {
  vi.clearAllMocks();

  mockedUseAssetDetailQuery.mockReturnValue(asQueryResult<ReturnType<typeof assetQueries.useAssetDetailQuery>>({
    data: {
      id: 1,
      kind: "knowledge",
      title: "운영 가이드",
      slug: "ops-guide",
      summary: "운영 절차 요약",
      content: "본문",
      categoryId: 1,
      categoryName: "운영",
      categorySlug: "ops",
      projectId: 1,
      projectName: "에이전트 허브",
      ownerUserId: 1,
      ownerName: "김하늘",
      status: "approved",
      attachmentName: "requirements.pdf",
      attachmentUrl: null,
      externalUrl: null,
      createdAt: "2026-03-16T00:00:00.000Z",
      updatedAt: "2026-03-16T00:00:00.000Z",
      approvedAt: "2026-03-16T00:00:00.000Z",
      rejectedReason: null,
      ratingScore: 4.5,
      viewCount: 10,
      downloadCount: 5,
      likeCount: 3,
      favoriteCount: 2,
      likedByMe: false,
      favoritedByMe: false,
      downloadedByMe: false,
    },
    isLoading: false,
  }));
  mockedUseAssetCommentsQuery.mockReturnValue(asQueryResult<ReturnType<typeof assetQueries.useAssetCommentsQuery>>({
    data: [],
    isLoading: false,
  }));
  mockedUseCreateAssetCommentMutation.mockReturnValue(asMutationResult<ReturnType<typeof assetMutations.useCreateAssetCommentMutation>>({
    mutateAsync: vi.fn(),
    isPending: false,
  }));
  mockedUseDownloadAssetMutation.mockReturnValue(asMutationResult<ReturnType<typeof assetMutations.useDownloadAssetMutation>>({
    mutate: vi.fn(),
  }));
  mockedUseFavoriteAssetMutation.mockReturnValue(asMutationResult<ReturnType<typeof assetMutations.useFavoriteAssetMutation>>({
    mutate: vi.fn(),
  }));
  mockedUseLikeAssetMutation.mockReturnValue(asMutationResult<ReturnType<typeof assetMutations.useLikeAssetMutation>>({
    mutate: vi.fn(),
  }));
});

describe("AssetDetailPage", () => {
  it("mock 첨부 메타를 보여주고 다운로드 버튼은 비활성화한다", () => {
    renderWithAppProviders(<AssetDetailPage />);

    expect(screen.getByText(/첨부 requirements\\.pdf/)).toBeInTheDocument();
    expect(screen.getByText("mock 미리보기만 저장됨")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /다운로드/i })).toBeDisabled();
  });
});
