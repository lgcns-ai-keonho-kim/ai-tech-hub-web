/**
 * 목적: 홈 대시보드 페이지가 소유하는 합성 응답 타입을 정의한다.
 * 설명: 홈 화면 전용 집계 데이터는 엔티티 공용 타입과 분리해 페이지 모델이 관리한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/pages/dashboard/home/model/use-home-dashboard-query.ts
 */
import type { AssetKind } from "@/entities/asset/model/types";

export type HomeDashboardSection = {
  totalAssets: number;
  postDeltaFromYesterday: number;
  commentDeltaFromYesterday: number;
  pendingAssets?: number;
};

export type HomeDashboard = {
  canSeePendingAssets: boolean;
  sections: Record<AssetKind, HomeDashboardSection>;
};
