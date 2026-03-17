/**
 * 목적: 자산 엔티티가 소유하는 타입 계약을 정의한다.
 * 설명: 목록, 상세, 카테고리, 상호작용, 개인 대시보드가 같은 자산 모델을 공유하게 한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/entities/asset/model/queries.ts, ui/src/features/asset-actions/model/mutations.ts
 */
export type AssetKind = "code" | "knowledge" | "troubleshooting" | "lesson";
export type AssetStatus = "pending" | "approved" | "rejected";
export type AssetSort = "latest" | "rating" | "downloads";
export type AssetViewMode = "card" | "list";

export type AssetCategory = {
  id: number;
  kind: AssetKind;
  name: string;
  slug: string;
  sortOrder: number;
};

export type AssetSummary = {
  id: number;
  kind: AssetKind;
  title: string;
  slug: string;
  summary: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  projectId: number | null;
  projectName: string | null;
  ownerUserId: number;
  ownerName: string;
  status: AssetStatus;
  attachmentName: string | null;
  attachmentUrl: string | null;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  ratingScore: number;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  favoriteCount: number;
  likedByMe?: boolean;
  favoritedByMe?: boolean;
  downloadedByMe?: boolean;
};

export type AssetDetail = AssetSummary & {
  content: string;
  rejectedReason: string | null;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type PaginatedAssets = {
  assets: AssetSummary[];
  pagination: PaginationMeta;
};

export type AssetComment = {
  id: number;
  assetId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type MyAssetDashboard = {
  totalAssets: number;
  totalDownloads: number;
  totalLikes: number;
  totalFavorites: number;
};

export type CreateAssetInput = {
  kind: AssetKind;
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: number;
  projectId: number | null;
  attachmentName: string | null;
  attachmentUrl: string | null;
  externalUrl: string | null;
};
