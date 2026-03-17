/**
 * 목적: 트러블슈팅 페이지용 시드를 정의한다.
 * 설명: 각 프로젝트에서 실제로 겪을 수 있는 이슈와 해결 기록을 프로젝트별로 제공한다.
 * 적용 패턴: 페이지 시드 모듈 패턴
 * 참조: backend/src/db/seed-pages/shared.ts
 */
import { createAsset, iso } from "@/db/seed-pages/shared";
import type { SeedBundle } from "@/db/seed-pages/types";

function issue(
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
    kind: "troubleshooting",
    title,
    slug,
    summary,
    content,
    categoryId: 11,
    projectId,
    ownerUserId,
    status,
    attachmentName: null,
    attachmentUrl: null,
    externalUrl: `https://mock.local/issues/${slug}`,
    createdAt: iso(day, hour),
    approvedBy,
  });
}

export const troubleshootingPageSeed: SeedBundle = {
  assetCategories: [
    { id: 11, kind: "troubleshooting", name: "이슈 해결", slug: "issue-resolution", sortOrder: 10 },
  ],
  assets: [
    issue(201, 1, "MCP 승인 큐 정체 이슈", "mcp-approval-queue-delay", "승인 큐 적체로 알림 전파가 늦어진 이슈와 해결 절차", "# MCP 승인 큐 정체 이슈\n\n큐 길이 증가 원인과 재처리 절차를 정리합니다.", 2, "approved", 2, 12, 14),
    issue(202, 2, "RAG 응답 지연 이슈", "rag-latency-issue", "검색 인덱스 갱신 지연으로 발생한 응답 지연 문제와 해결 기록", "# RAG 응답 지연 이슈\n\n색인 주기 조정, 캐시 정책 변경, 재현 절차를 정리합니다.", 2, "approved", 2, 12, 15),
    issue(203, 3, "Kubernetes Ingress 502 장애 대응 기록", "kubernetes-ingress-502-troubleshooting", "Ingress timeout과 readiness probe 설정 누락으로 발생한 장애 대응 기록", "# Kubernetes Ingress 502 장애 대응 기록\n\n원인 분석, 설정 비교, 재발 방지 항목을 정리합니다.", 5, "approved", 5, 12, 16),
    issue(204, 4, "Airflow DAG 배포 실패 이슈", "airflow-dag-deployment-failure", "의존성 누락으로 배포가 실패한 케이스와 수정 절차를 정리한 문서", "# Airflow DAG 배포 실패 이슈\n\n패키지 누락, 이미지 재빌드, 검증 체크리스트를 기록합니다.", 6, "pending", null, 12, 17),
    issue(205, 5, "Copilot 컨텍스트 누락 이슈", "copilot-context-missing-issue", "상담 이력 일부가 프롬프트에 주입되지 않던 이슈와 해결 기록", "# Copilot 컨텍스트 누락 이슈\n\n주입 누락 조건, 수정 사항, 회귀 테스트 포인트를 정리합니다.", 3, "approved", 5, 13, 14),
    issue(206, 6, "비용 집계 배치 지연 이슈", "cost-batch-delay-issue", "원천 데이터 수집 지연으로 비용 집계가 밀린 이슈 대응 기록", "# 비용 집계 배치 지연 이슈\n\n지연 원인, 임시 우회, 운영 보완책을 정리합니다.", 7, "approved", 5, 13, 15),
    issue(207, 7, "포털 권한 캐시 불일치 이슈", "portal-permission-cache-issue", "권한 변경 직후 메뉴 노출 상태가 맞지 않던 이슈 대응 기록", "# 포털 권한 캐시 불일치 이슈\n\n캐시 무효화 누락과 수정 방식을 정리합니다.", 3, "approved", 2, 13, 16),
    issue(208, 8, "이벤트 대시보드 알림 중복 이슈", "incident-alert-duplication-issue", "동일 장애에 대해 중복 알림이 반복 생성되던 이슈 대응 기록", "# 이벤트 대시보드 알림 중복 이슈\n\n중복 조건, 집계 키, 차단 규칙을 정리합니다.", 7, "pending", null, 13, 17),
  ],
};
