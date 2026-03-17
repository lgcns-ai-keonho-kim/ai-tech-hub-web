/**
 * 목적: 지식 자산 페이지용 시드를 정의한다.
 * 설명: 25개 프로젝트의 현재 단계를 차트에서 읽을 수 있도록 단계 문서를 일관된 규칙으로 구성한다.
 * 적용 패턴: 페이지 시드 모듈 패턴
 * 참조: backend/src/db/seed-pages/shared.ts, backend/src/db/seed-pages/projects-page.ts
 */
import { createAsset, iso } from "@/db/seed-pages/shared";
import { projectBlueprints } from "@/db/seed-pages/projects-page";
import type { SeedBundle } from "@/db/seed-pages/types";

type KnowledgeStage =
  | "proposal"
  | "analysis"
  | "design"
  | "development"
  | "test"
  | "operations";

type KnowledgeDocStage = KnowledgeStage | "rnd";

const stageCategoryIdMap: Record<KnowledgeDocStage, number> = {
  proposal: 4,
  analysis: 5,
  design: 6,
  development: 7,
  test: 8,
  operations: 9,
  rnd: 10,
};

const stageTitleSuffixMap: Record<KnowledgeDocStage, string> = {
  proposal: "요구사항 정의서",
  analysis: "현황 분석서",
  design: "설계서",
  development: "구현 명세서",
  test: "검증 보고서",
  operations: "운영 전환 문서",
  rnd: "사전 검토 메모",
};

const stageSummaryPrefixMap: Record<KnowledgeDocStage, string> = {
  proposal: "프로젝트 범위와 목표를 정리한",
  analysis: "현행 흐름과 리스크를 분석한",
  design: "구조와 인터페이스를 설계한",
  development: "구현과 연결 방식을 정의한",
  test: "검증 시나리오와 결과를 정리한",
  operations: "운영 전환과 정착 계획을 정리한",
  rnd: "도입 전 비교 검토를 담은",
};

const stageSequenceMap: Record<KnowledgeStage, KnowledgeDocStage[]> = {
  proposal: ["proposal", "rnd"],
  analysis: ["proposal", "analysis"],
  design: ["proposal", "analysis", "design"],
  development: ["proposal", "analysis", "design", "development"],
  test: ["proposal", "analysis", "design", "test"],
  operations: ["analysis", "design", "test", "operations"],
};

function buildDocContent(projectName: string, projectSummary: string, stage: KnowledgeDocStage) {
  const stageTopicMap: Record<KnowledgeDocStage, string> = {
    proposal: "목표, 범위, 성공 기준",
    analysis: "현행 흐름, 병목, 위험 요소",
    design: "구조, 역할 분리, 인터페이스",
    development: "구현 작업, 연결 규칙, 산출물",
    test: "검증 시나리오, 실패 케이스, 보완 계획",
    operations: "운영 인수인계, 모니터링, 후속 과제",
    rnd: "후보 기술, 비교 기준, 도입 가설",
  };

  return `# ${projectName} ${stageTitleSuffixMap[stage]}

${projectSummary}

- 핵심 주제: ${stageTopicMap[stage]}
- 검토 기준: 프로젝트 단계 산정과 차트 가시성에 필요한 대표 문서 유지
- 운영 포인트: 단계가 겹쳐 보이지 않도록 최고 단계 문서를 명확히 배치
- 비고: mock 시드 전용 문서로 목록/상세/차트 검증을 함께 지원`;
}

const knowledgeAssets = (() => {
  let nextId = 101;

  return projectBlueprints.flatMap((project) =>
    stageSequenceMap[project.stageTarget].map((stage, index) =>
      createAsset({
        id: nextId++,
        kind: "knowledge",
        title: `${project.name} ${stageTitleSuffixMap[stage]}`,
        slug: `${project.slug}-${stage}`,
        summary: `${stageSummaryPrefixMap[stage]} 프로젝트 문서`,
        content: buildDocContent(project.name, project.summary, stage),
        categoryId: stageCategoryIdMap[stage],
        projectId: project.id,
        ownerUserId: project.managerUserId,
        status: "approved",
        attachmentName: `${project.slug}-${stage}.pdf`,
        attachmentUrl: `https://mock.local/docs/${project.slug}-${stage}.pdf`,
        externalUrl: null,
        createdAt: iso(project.id, 13 + index),
        approvedBy: project.managerUserId,
      }),
    ),
  );
})();

export const knowledgeAssetsPageSeed: SeedBundle = {
  assetCategories: [
    { id: 4, kind: "knowledge", name: "제안", slug: "proposal", sortOrder: 10 },
    { id: 5, kind: "knowledge", name: "분석", slug: "analysis", sortOrder: 20 },
    { id: 6, kind: "knowledge", name: "설계", slug: "design", sortOrder: 30 },
    { id: 7, kind: "knowledge", name: "개발", slug: "development", sortOrder: 40 },
    { id: 8, kind: "knowledge", name: "테스트", slug: "test", sortOrder: 50 },
    { id: 9, kind: "knowledge", name: "운영", slug: "operations", sortOrder: 60 },
    { id: 10, kind: "knowledge", name: "R&D", slug: "rnd", sortOrder: 70 },
  ],
  assets: knowledgeAssets,
};
