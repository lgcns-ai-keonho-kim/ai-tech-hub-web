/**
 * 목적: 페이지별 시드 모듈이 공유하는 데이터 타입을 정의한다.
 * 설명: 부트스트랩 대상 테이블별 입력 형태를 공통 계약으로 고정한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: backend/src/db/seed-pages/shared.ts, backend/src/db/bootstrap.ts
 */
export type SeedUser = {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  accountStatus: "pending" | "approved" | "rejected";
  globalRole: "user" | "admin";
  createdAt: string;
  updatedAt: string;
};

export type SeedProject = {
  id: number;
  name: string;
  slug: string;
  customerName: string;
  summary: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

export type SeedProjectMembership = {
  id: number;
  projectId: number;
  userId: number;
  role: "user" | "manager";
  createdAt: string;
};

export type SeedAssetCategory = {
  id: number;
  kind: "code" | "knowledge" | "troubleshooting" | "lesson";
  name: string;
  slug: string;
  sortOrder: number;
};

export type SeedAsset = {
  id: number;
  kind: "code" | "knowledge" | "troubleshooting" | "lesson";
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: number;
  projectId: number | null;
  ownerUserId: number;
  status: "approved" | "pending" | "rejected";
  attachmentName: string | null;
  attachmentUrl: string | null;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  approvedBy: number | null;
  rejectedReason: string | null;
};

export type SeedAssetStat = {
  assetId: number;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  favoriteCount: number;
  ratingScore: number;
};

export type SeedAssetPreference = {
  id: number;
  assetId: number;
  userId: number;
  liked: 0 | 1;
  favorited: 0 | 1;
  updatedAt: string;
};

export type SeedAssetDownload = {
  id: number;
  assetId: number;
  userId: number;
  createdAt: string;
};

export type SeedAssetComment = {
  id: number;
  assetId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type SeedBoardPost = {
  id: number;
  type: "notice" | "qna";
  authorUserId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type SeedBoardComment = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type SeedNotification = {
  id: number;
  userId: number;
  type: "asset-approved" | "asset-rejected" | "asset-comment" | "qna-comment";
  targetType: "asset" | "board";
  targetId: number;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export type SeedBundle = {
  users?: SeedUser[];
  projects?: SeedProject[];
  projectMemberships?: SeedProjectMembership[];
  assetCategories?: SeedAssetCategory[];
  assets?: SeedAsset[];
  assetPreferences?: SeedAssetPreference[];
  assetDownloads?: SeedAssetDownload[];
  assetComments?: SeedAssetComment[];
  boardPosts?: SeedBoardPost[];
  boardComments?: SeedBoardComment[];
  notifications?: SeedNotification[];
};
