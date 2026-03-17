/**
 * 목적: 페이지별 시드 모듈을 병합한 최종 부트스트랩 데이터를 제공한다.
 * 설명: 페이지 기준으로 나뉜 시드 조각을 하나의 정합한 데이터 집합으로 합쳐 bootstrap이 그대로 소비하게 한다.
 * 적용 패턴: 조립형 시드 패턴
 * 참조: backend/src/db/seed-pages, backend/src/db/bootstrap.ts
 */
import { boardPageSeed } from "@/db/seed-pages/board-page";
import { codeAssetsPageSeed } from "@/db/seed-pages/code-assets-page";
import { engagementPageSeed } from "@/db/seed-pages/engagement-page";
import { knowledgeAssetsPageSeed } from "@/db/seed-pages/knowledge-assets-page";
import { lessonsPageSeed } from "@/db/seed-pages/lessons-page";
import { projectsPageSeed } from "@/db/seed-pages/projects-page";
import { mergeSeedBundles, validateSeedBundle, buildAssetStats } from "@/db/seed-pages/shared";
import { troubleshootingPageSeed } from "@/db/seed-pages/troubleshooting-page";
import { usersPageSeed } from "@/db/seed-pages/users-page";

const mergedSeed = mergeSeedBundles(
  usersPageSeed,
  projectsPageSeed,
  codeAssetsPageSeed,
  knowledgeAssetsPageSeed,
  troubleshootingPageSeed,
  lessonsPageSeed,
  boardPageSeed,
  engagementPageSeed,
);

validateSeedBundle(mergedSeed);

export const seedUsers = mergedSeed.users;
export const seedProjects = mergedSeed.projects;
export const seedProjectMemberships = mergedSeed.projectMemberships;
export const seedAssetCategories = mergedSeed.assetCategories;
export const seedAssets = mergedSeed.assets;
export const seedAssetStats = buildAssetStats(mergedSeed.assets);
export const seedAssetPreferences = mergedSeed.assetPreferences;
export const seedAssetDownloads = mergedSeed.assetDownloads;
export const seedAssetComments = mergedSeed.assetComments;
export const seedBoardPosts = mergedSeed.boardPosts;
export const seedBoardComments = mergedSeed.boardComments;
export const seedNotifications = mergedSeed.notifications;
