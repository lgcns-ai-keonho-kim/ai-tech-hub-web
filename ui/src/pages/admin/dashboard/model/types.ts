/**
 * 목적: 관리자 대시보드 페이지가 소유하는 합성 응답 타입을 정의한다.
 * 설명: 관리자 KPI 집계는 화면 전용 계약으로 분리해 다른 엔티티와 결합하지 않게 유지한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/pages/admin/dashboard/model/use-admin-dashboard-query.ts
 */
import type { AssetKind, AssetStatus } from "@/entities/asset/model/types";

export type AdminDashboard = {
  totalUsers: number;
  totalAssets: number;
  assetsByKind: Record<AssetKind, number>;
  assetsByStatus: Record<AssetStatus, number>;
  assetsByProject: Array<{ projectId: number; projectName: string; count: number }>;
  assetsByCategory: Array<{ categoryId: number; categoryName: string; count: number }>;
};
