/**
 * 목적: 프로젝트 목록/상세 페이지용 시드를 정의한다.
 * 설명: 프로젝트 검색, 상세 탭, 매니저 승인 흐름에 필요한 프로젝트와 멤버십을 제공한다.
 * 적용 패턴: 페이지 시드 모듈 패턴
 * 참조: backend/src/db/seed-pages/users-page.ts, backend/src/db/seed-pages/knowledge-assets-page.ts
 */
import { iso } from "@/db/seed-pages/shared";
import type { SeedBundle, SeedProject, SeedProjectMembership } from "@/db/seed-pages/types";

type ProjectStageTarget =
  | "proposal"
  | "analysis"
  | "design"
  | "development"
  | "test"
  | "operations";

type ProjectBlueprint = {
  id: number;
  name: string;
  slug: string;
  customerName: string;
  summary: string;
  managerUserId: number;
  memberUserId: number;
  stageTarget: ProjectStageTarget;
};

export const projectBlueprints: ProjectBlueprint[] = [
  { id: 1, name: "MCP 업무 자동화", slug: "mcp-automation", customerName: "한빛손해보험", summary: "사내 업무 자동화용 에이전트와 운영 문서를 관리하는 프로젝트", managerUserId: 2, memberUserId: 3, stageTarget: "proposal" },
  { id: 2, name: "RAG 검색 고도화", slug: "rag-search-boost", customerName: "더존커머스", summary: "검색 품질, 평가 체계, 지연 이슈 대응 문서를 관리하는 프로젝트", managerUserId: 2, memberUserId: 6, stageTarget: "analysis" },
  { id: 3, name: "Kubernetes 운영 표준화", slug: "kubernetes-ops-standardization", customerName: "에코뱅크", summary: "클러스터 배포 표준, 운영 문서, 장애 대응 자산을 관리하는 프로젝트", managerUserId: 5, memberUserId: 3, stageTarget: "design" },
  { id: 4, name: "데이터 파이프라인 현대화", slug: "data-pipeline-modernization", customerName: "네오물류", summary: "수집-적재-변환 파이프라인 구조와 운영 자산을 관리하는 프로젝트", managerUserId: 2, memberUserId: 6, stageTarget: "development" },
  { id: 5, name: "고객 상담 Copilot 구축", slug: "customer-copilot-build", customerName: "미래컨택트센터", summary: "상담 지원 챗봇 구축을 위한 요구사항, 테스트, 회고 자료를 관리하는 프로젝트", managerUserId: 5, memberUserId: 6, stageTarget: "test" },
  { id: 6, name: "멀티클라우드 비용 최적화", slug: "multi-cloud-cost-optimization", customerName: "오로라리테일", summary: "클라우드 비용 분석, 태깅 정책, 비용 대시보드 자산을 관리하는 프로젝트", managerUserId: 5, memberUserId: 3, stageTarget: "operations" },
  { id: 7, name: "개발자 포털 개선", slug: "developer-portal-revamp", customerName: "아틀라스테크", summary: "사내 포털 IA, 권한 모델, 운영 배포 자산을 관리하는 프로젝트", managerUserId: 2, memberUserId: 3, stageTarget: "proposal" },
  { id: 8, name: "실시간 장애 대응 대시보드", slug: "incident-response-dashboard", customerName: "세이프시티", summary: "실시간 알림 대시보드, 이벤트 파이프라인, 운영 룰셋을 관리하는 프로젝트", managerUserId: 7, memberUserId: 6, stageTarget: "analysis" },
  { id: 9, name: "문서 분류 에이전트 도입", slug: "document-classification-agent-rollout", customerName: "한결카드", summary: "문서 자동 분류 에이전트 도입과 업무 연결 문서를 관리하는 프로젝트", managerUserId: 2, memberUserId: 6, stageTarget: "design" },
  { id: 10, name: "사내 검색 포털 통합", slug: "internal-search-portal-unification", customerName: "프라임제조", summary: "사내 검색 포털과 지식 탐색 경험을 통합하는 프로젝트", managerUserId: 5, memberUserId: 3, stageTarget: "development" },
  { id: 11, name: "보안 로그 이상 탐지", slug: "security-log-anomaly-detection", customerName: "시큐어웨이", summary: "보안 로그 이상 탐지 파이프라인과 대응 체계를 구축하는 프로젝트", managerUserId: 7, memberUserId: 6, stageTarget: "test" },
  { id: 12, name: "모델 라우팅 게이트웨이 정비", slug: "model-routing-gateway-refresh", customerName: "유니버설모빌리티", summary: "모델 선택, fallback, 비용 제어 규칙을 운영형으로 정비하는 프로젝트", managerUserId: 5, memberUserId: 3, stageTarget: "operations" },
  { id: 13, name: "계약 검토 Copilot 파일럿", slug: "contract-review-copilot-pilot", customerName: "브릿지법무", summary: "계약 검토 보조 Copilot의 파일럿 요구사항과 PoC 문서를 관리하는 프로젝트", managerUserId: 2, memberUserId: 6, stageTarget: "proposal" },
  { id: 14, name: "회의록 자동 요약 파이프라인", slug: "meeting-summary-pipeline", customerName: "오피스웨이브", summary: "회의록 자동 요약 생성과 배포 워크플로를 검증하는 프로젝트", managerUserId: 7, memberUserId: 3, stageTarget: "analysis" },
  { id: 15, name: "지식 베이스 정합성 점검", slug: "knowledge-base-consistency-check", customerName: "코어에너지", summary: "지식 문서 정합성 점검과 정제 플로우를 체계화하는 프로젝트", managerUserId: 5, memberUserId: 6, stageTarget: "design" },
  { id: 16, name: "벡터 메모리 운영 자동화", slug: "vector-memory-ops-automation", customerName: "미라클헬스", summary: "벡터 메모리 운영 자동화와 백업 절차를 정리하는 프로젝트", managerUserId: 7, memberUserId: 3, stageTarget: "development" },
  { id: 17, name: "QA 리플레이 평가 체계", slug: "qa-replay-evaluation-framework", customerName: "넥스트파이낸스", summary: "운영 로그 기반 QA 리플레이 평가 체계를 검증하는 프로젝트", managerUserId: 2, memberUserId: 6, stageTarget: "test" },
  { id: 18, name: "배포 승격 승인 워크플로", slug: "deployment-promotion-approval-flow", customerName: "플럭스리테일", summary: "배포 승격 승인 절차와 검증 문서를 운영 흐름에 맞게 정비하는 프로젝트", managerUserId: 5, memberUserId: 3, stageTarget: "operations" },
  { id: 19, name: "사내 위키 RAG 전환", slug: "internal-wiki-rag-migration", customerName: "한솔미디어", summary: "사내 위키를 RAG 기반 검색 체계로 전환하기 위한 프로젝트", managerUserId: 2, memberUserId: 3, stageTarget: "proposal" },
  { id: 20, name: "고객 문의 분류 자동화", slug: "customer-inquiry-routing-automation", customerName: "에버콜", summary: "고객 문의 자동 분류와 에스컬레이션 흐름을 만드는 프로젝트", managerUserId: 7, memberUserId: 6, stageTarget: "analysis" },
  { id: 21, name: "세션 메모리 시각화 도구", slug: "session-memory-visualizer", customerName: "큐브인사이트", summary: "세션 메모리와 검색 컨텍스트를 시각화하는 도구를 만드는 프로젝트", managerUserId: 5, memberUserId: 3, stageTarget: "design" },
  { id: 22, name: "비용 예측 대시보드 고도화", slug: "cost-forecast-dashboard-advance", customerName: "그린캐피탈", summary: "클라우드 비용 예측 대시보드와 알림 규칙을 고도화하는 프로젝트", managerUserId: 2, memberUserId: 6, stageTarget: "development" },
  { id: 23, name: "온콜 핸드오버 자동화", slug: "oncall-handover-automation", customerName: "세이프넷", summary: "온콜 인수인계와 장애 맥락 전달을 자동화하는 프로젝트", managerUserId: 7, memberUserId: 3, stageTarget: "test" },
  { id: 24, name: "멀티테넌트 정책 운영 정비", slug: "multi-tenant-policy-ops-refresh", customerName: "테넌트브릿지", summary: "멀티테넌트 정책과 운영 예외 규칙을 정비하는 프로젝트", managerUserId: 5, memberUserId: 6, stageTarget: "operations" },
  { id: 25, name: "에이전트 품질 기준선 재정의", slug: "agent-quality-baseline-reset", customerName: "인사이트허브", summary: "에이전트 품질 기준선과 검증 체크리스트를 재정의하는 프로젝트", managerUserId: 2, memberUserId: 3, stageTarget: "test" },
];

const seedProjects: SeedProject[] = projectBlueprints.map((project) => ({
  id: project.id,
  name: project.name,
  slug: project.slug,
  customerName: project.customerName,
  summary: project.summary,
  createdBy: 1,
  createdAt: iso(project.id, 10),
  updatedAt: iso(project.id, 10),
}));

const seedProjectMemberships: SeedProjectMembership[] = projectBlueprints.flatMap((project) => [
  {
    id: project.id * 2 - 1,
    projectId: project.id,
    userId: project.managerUserId,
    role: "manager",
    createdAt: iso(project.id, 11),
  },
  {
    id: project.id * 2,
    projectId: project.id,
    userId: project.memberUserId,
    role: "user",
    createdAt: iso(project.id, 11, 10),
  },
]);

export const projectsPageSeed: SeedBundle = {
  projects: seedProjects,
  projectMemberships: seedProjectMemberships,
};
