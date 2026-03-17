/**
 * 목적: 페이지별 시드 모듈의 공통 헬퍼를 제공한다.
 * 설명: 날짜 생성, 자산 생성, 시드 병합, 정합성 검증, 통계 생성 로직을 한 곳에 모은다.
 * 적용 패턴: 헬퍼 조합 패턴
 * 참조: backend/src/db/seed-pages/types.ts, backend/src/db/seed-data.ts
 */
import type {
  SeedAsset,
  SeedAssetComment,
  SeedAssetDownload,
  SeedAssetPreference,
  SeedAssetStat,
  SeedBoardComment,
  SeedBoardPost,
  SeedBundle,
  SeedNotification,
  SeedProject,
  SeedProjectMembership,
  SeedUser,
} from "@/db/seed-pages/types";

export function iso(day: number, hour: number, minute = 0) {
  return `2026-03-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`;
}

export function createAsset(input: Omit<SeedAsset, "updatedAt" | "approvedAt" | "approvedBy" | "rejectedReason"> & {
  updatedAt?: string;
  approvedAt?: string | null;
  approvedBy?: number | null;
  rejectedReason?: string | null;
}) {
  const updatedAt = input.updatedAt ?? input.createdAt;
  const approvedAt = input.status === "approved" ? (input.approvedAt ?? updatedAt) : null;
  const approvedBy = input.status === "approved" ? (input.approvedBy ?? input.ownerUserId) : null;

  return {
    ...input,
    updatedAt,
    approvedAt,
    approvedBy,
    rejectedReason: input.rejectedReason ?? null,
  } satisfies SeedAsset;
}

export function mergeSeedBundles(...bundles: SeedBundle[]) {
  return {
    users: bundles.flatMap((bundle) => bundle.users ?? []),
    projects: bundles.flatMap((bundle) => bundle.projects ?? []),
    projectMemberships: bundles.flatMap((bundle) => bundle.projectMemberships ?? []),
    assetCategories: bundles.flatMap((bundle) => bundle.assetCategories ?? []),
    assets: bundles.flatMap((bundle) => bundle.assets ?? []),
    assetPreferences: bundles.flatMap((bundle) => bundle.assetPreferences ?? []),
    assetDownloads: bundles.flatMap((bundle) => bundle.assetDownloads ?? []),
    assetComments: bundles.flatMap((bundle) => bundle.assetComments ?? []),
    boardPosts: bundles.flatMap((bundle) => bundle.boardPosts ?? []),
    boardComments: bundles.flatMap((bundle) => bundle.boardComments ?? []),
    notifications: bundles.flatMap((bundle) => bundle.notifications ?? []),
  };
}

function assertUniqueNumber(label: string, items: Array<{ id: number }>) {
  const seen = new Set<number>();
  items.forEach((item) => {
    if (seen.has(item.id)) {
      throw new Error(`${label} id 중복: ${item.id}`);
    }
    seen.add(item.id);
  });
}

function assertUniqueString(label: string, values: string[]) {
  const seen = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value)) {
      throw new Error(`${label} 중복: ${value}`);
    }
    seen.add(value);
  });
}

export function validateSeedBundle(bundle: ReturnType<typeof mergeSeedBundles>) {
  assertUniqueNumber("users", bundle.users);
  assertUniqueNumber("projects", bundle.projects);
  assertUniqueNumber("projectMemberships", bundle.projectMemberships);
  assertUniqueNumber("assetCategories", bundle.assetCategories);
  assertUniqueNumber("assets", bundle.assets);
  assertUniqueNumber("assetPreferences", bundle.assetPreferences);
  assertUniqueNumber("assetDownloads", bundle.assetDownloads);
  assertUniqueNumber("assetComments", bundle.assetComments);
  assertUniqueNumber("boardPosts", bundle.boardPosts);
  assertUniqueNumber("boardComments", bundle.boardComments);
  assertUniqueNumber("notifications", bundle.notifications);

  assertUniqueString("user email", bundle.users.map((item) => item.email));
  assertUniqueString("project slug", bundle.projects.map((item) => item.slug));
  assertUniqueString("category slug", bundle.assetCategories.map((item) => item.slug));
  assertUniqueString("asset slug", bundle.assets.map((item) => item.slug));

  const userIds = new Set(bundle.users.map((item) => item.id));
  const projectIds = new Set(bundle.projects.map((item) => item.id));
  const categoryIds = new Set(bundle.assetCategories.map((item) => item.id));
  const assetIds = new Set(bundle.assets.map((item) => item.id));
  const boardPostIds = new Set(bundle.boardPosts.map((item) => item.id));

  bundle.projects.forEach((project) => {
    if (!userIds.has(project.createdBy)) {
      throw new Error(`projects.createdBy 누락: ${project.id}`);
    }
  });

  bundle.projectMemberships.forEach((membership) => {
    if (!projectIds.has(membership.projectId) || !userIds.has(membership.userId)) {
      throw new Error(`projectMemberships 외래키 누락: ${membership.id}`);
    }
  });

  bundle.assets.forEach((asset) => {
    if (!categoryIds.has(asset.categoryId) || !userIds.has(asset.ownerUserId)) {
      throw new Error(`assets 외래키 누락: ${asset.id}`);
    }
    if (asset.projectId && !projectIds.has(asset.projectId)) {
      throw new Error(`assets.projectId 누락: ${asset.id}`);
    }
    if (asset.approvedBy && !userIds.has(asset.approvedBy)) {
      throw new Error(`assets.approvedBy 누락: ${asset.id}`);
    }
  });

  bundle.assetPreferences.forEach((item) => {
    if (!assetIds.has(item.assetId) || !userIds.has(item.userId)) {
      throw new Error(`assetPreferences 외래키 누락: ${item.id}`);
    }
  });

  bundle.assetDownloads.forEach((item) => {
    if (!assetIds.has(item.assetId) || !userIds.has(item.userId)) {
      throw new Error(`assetDownloads 외래키 누락: ${item.id}`);
    }
  });

  bundle.assetComments.forEach((item) => {
    if (!assetIds.has(item.assetId) || !userIds.has(item.userId)) {
      throw new Error(`assetComments 외래키 누락: ${item.id}`);
    }
  });

  bundle.boardPosts.forEach((item) => {
    if (!userIds.has(item.authorUserId)) {
      throw new Error(`boardPosts.authorUserId 누락: ${item.id}`);
    }
  });

  bundle.boardComments.forEach((item) => {
    if (!boardPostIds.has(item.postId) || !userIds.has(item.userId)) {
      throw new Error(`boardComments 외래키 누락: ${item.id}`);
    }
  });

  bundle.notifications.forEach((item) => {
    if (!userIds.has(item.userId)) {
      throw new Error(`notifications.userId 누락: ${item.id}`);
    }
    if (item.targetType === "asset" && !assetIds.has(item.targetId)) {
      throw new Error(`notifications.asset target 누락: ${item.id}`);
    }
    if (item.targetType === "board" && !boardPostIds.has(item.targetId)) {
      throw new Error(`notifications.board target 누락: ${item.id}`);
    }
  });
}

export function buildAssetStats(assets: SeedAsset[]): SeedAssetStat[] {
  return assets.map((asset, index) => {
    const weight = index + 1;
    const approved = asset.status === "approved";
    const baseByKind = {
      code: { view: 210, download: 64, like: 28, favorite: 18, rating: 4.7 },
      knowledge: { view: 160, download: 24, like: 16, favorite: 10, rating: 4.5 },
      troubleshooting: { view: 108, download: 0, like: 11, favorite: 6, rating: 4.3 },
      lesson: { view: 84, download: 0, like: 8, favorite: 4, rating: 4.2 },
    }[asset.kind];

    if (!approved) {
      return {
        assetId: asset.id,
        viewCount: 18 + (weight % 11) * 3,
        downloadCount: 0,
        likeCount: 1 + (weight % 3),
        favoriteCount: weight % 2,
        ratingScore: 4.0,
      };
    }

    return {
      assetId: asset.id,
      viewCount: baseByKind.view + (weight % 17) * 7,
      downloadCount: Math.max(0, baseByKind.download - (weight % 9) * 3),
      likeCount: Math.max(2, baseByKind.like - (weight % 7)),
      favoriteCount: Math.max(1, baseByKind.favorite - (weight % 5)),
      ratingScore: Number((baseByKind.rating - (weight % 4) * 0.1).toFixed(1)),
    };
  });
}

export type { SeedAssetComment, SeedAssetDownload, SeedAssetPreference, SeedBoardComment, SeedBoardPost, SeedBundle, SeedNotification, SeedProject, SeedProjectMembership, SeedUser };
