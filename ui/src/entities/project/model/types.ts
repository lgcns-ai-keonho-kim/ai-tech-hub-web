/**
 * 목적: 프로젝트 엔티티가 소유하는 타입 계약을 정의한다.
 * 설명: 프로젝트 목록/상세/승인 대기열/관리자 관리 화면이 같은 프로젝트 모델을 공유하게 한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/entities/project/model/queries.ts, ui/src/features/admin-projects/model/mutations.ts
 */
import type { AssetKind, AssetSummary } from "@/entities/asset/model/types";
import type { ProjectRole } from "@/entities/session/model/types";

export type ProjectStage =
  | "proposal"
  | "analysis"
  | "design"
  | "development"
  | "test"
  | "operations";

export type ProjectSummary = {
  id: number;
  name: string;
  slug: string;
  customerName: string;
  summary: string;
  managerNames: string[];
  currentStage: ProjectStage | null;
  stageCounts: Record<ProjectStage, number>;
  assetCounts: Partial<Record<AssetKind, number>>;
};

export type ProjectApprovalItem = AssetSummary & {
  projectRole: ProjectRole;
};

export type CreateProjectInput = {
  name: string;
  slug: string;
  customerName: string;
  summary: string;
};

export type UpdateProjectInput = CreateProjectInput;

export type DeleteImpactSummary = {
  totalAssetCount: number;
  assetsByKind: Array<{ kind: AssetKind; count: number }>;
  assetsByCategory: Array<{ categoryId: number; categoryName: string; count: number }>;
};

export type ProjectDetailResponse = {
  project: ProjectSummary;
  assets: AssetSummary[];
};
