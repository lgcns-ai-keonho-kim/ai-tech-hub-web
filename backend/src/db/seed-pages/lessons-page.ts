/**
 * 목적: Lesson & Learned 페이지용 시드를 정의한다.
 * 설명: 프로젝트별 회고 문서를 제공해 회고 탭과 승인 대기 흐름을 함께 검증할 수 있게 한다.
 * 적용 패턴: 페이지 시드 모듈 패턴
 * 참조: backend/src/db/seed-pages/shared.ts
 */
import { createAsset, iso } from "@/db/seed-pages/shared";
import type { SeedBundle } from "@/db/seed-pages/types";

function retrospective(
  id: number,
  projectId: number,
  title: string,
  slug: string,
  summary: string,
  content: string,
  ownerUserId: number,
  status: "approved" | "pending",
  approvedBy: number | null,
  day: number,
  hour: number,
) {
  return createAsset({
    id,
    kind: "lesson",
    title,
    slug,
    summary,
    content,
    categoryId: 12,
    projectId,
    ownerUserId,
    status,
    attachmentName: null,
    attachmentUrl: null,
    externalUrl: null,
    createdAt: iso(day, hour),
    approvedBy,
  });
}

export const lessonsPageSeed: SeedBundle = {
  assetCategories: [
    { id: 12, kind: "lesson", name: "회고", slug: "retrospective", sortOrder: 10 },
  ],
  assets: [
    retrospective(301, 1, "MCP 자동화 1차 회고", "mcp-retrospective-1", "1차 배포 이후 배운 점과 다음 스프린트 개선 과제를 정리한 회고", "# MCP 자동화 1차 회고\n\n좋았던 점, 아쉬웠던 점, 다음 액션을 정리합니다.", 3, "pending", null, 14, 14),
    retrospective(302, 2, "RAG 검색 고도화 회고", "rag-search-boost-retrospective", "평가 체계 개선 이후 배운 점과 잔여 부채를 정리한 회고", "# RAG 검색 고도화 회고\n\n평가 자동화와 운영 이슈 관점의 배움을 정리합니다.", 2, "approved", 2, 14, 15),
    retrospective(303, 3, "Kubernetes 운영 표준화 회고", "kubernetes-ops-retrospective", "운영 표준화 적용 이후 배포 속도와 장애 대응 측면의 회고", "# Kubernetes 운영 표준화 회고\n\n표준화 효과와 다음 운영 개선 목표를 정리합니다.", 5, "approved", 5, 14, 16),
    retrospective(304, 4, "데이터 파이프라인 현대화 회고", "data-pipeline-modernization-retrospective", "이행 과정에서 얻은 운영 교훈과 다음 개선 항목을 정리한 회고", "# 데이터 파이프라인 현대화 회고\n\n전환 과정과 운영 안정화 관점의 배움을 정리합니다.", 6, "pending", null, 14, 17),
    retrospective(305, 5, "고객 상담 Copilot 베타 회고", "customer-copilot-beta-retrospective", "베타 운영에서 수집한 사용자 피드백과 후속 개선 계획을 정리한 회고", "# 고객 상담 Copilot 베타 회고\n\n사용자 피드백과 품질 보완 계획을 정리합니다.", 6, "pending", null, 15, 14),
    retrospective(306, 6, "멀티클라우드 비용 최적화 회고", "multi-cloud-cost-optimization-retrospective", "초기 절감 작업 후 남은 과금 리스크와 운영 교훈을 정리한 회고", "# 멀티클라우드 비용 최적화 회고\n\n절감 활동과 조직 운영 관점의 배움을 정리합니다.", 7, "approved", 5, 15, 15),
    retrospective(307, 7, "개발자 포털 개선 회고", "developer-portal-revamp-retrospective", "포털 개선 적용 이후 탐색성과 권한 UX 측면의 회고", "# 개발자 포털 개선 회고\n\n탐색성 개선 효과와 잔여 UX 부채를 정리합니다.", 3, "approved", 2, 15, 16),
    retrospective(308, 8, "장애 대응 대시보드 회고", "incident-response-dashboard-retrospective", "운영팀 사용 이후 대시보드와 알림 체계에 대한 회고", "# 장애 대응 대시보드 회고\n\n운영 반응 속도와 알림 품질 측면의 배움을 정리합니다.", 7, "pending", null, 15, 17),
  ],
};
