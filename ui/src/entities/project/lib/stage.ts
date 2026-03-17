/**
 * 목적: 프로젝트 단계 순서와 표시 스타일을 제공한다.
 * 설명: 프로젝트 목록, 홈 차트, 자산 카테고리 배지가 같은 단계 체계를 공유하게 한다.
 * 적용 패턴: 정적 구성 패턴
 * 참조: ui/src/widgets/project-stage-summary-panel.tsx, ui/src/pages/projects-page.tsx
 */
import type { CSSProperties } from "react";

import type { ProjectStage } from "@/entities/project/model/types";

export const projectStageOrder: ProjectStage[] = [
  "proposal",
  "analysis",
  "design",
  "development",
  "test",
  "operations",
];

export const projectStageLabels: Record<ProjectStage, string> = {
  proposal: "제안",
  analysis: "분석",
  design: "설계",
  development: "개발",
  test: "테스트",
  operations: "운영",
};

export type StagePillTone = ProjectStage | "rnd";

const stageToneVarMap: Record<StagePillTone, string> = {
  proposal: "--chart-stage-1",
  analysis: "--chart-stage-2",
  design: "--chart-stage-3",
  development: "--chart-stage-4",
  test: "--chart-stage-5",
  operations: "--chart-stage-6",
  rnd: "--chart-stage-rnd",
};

export function isStagePillTone(value: string | null | undefined): value is StagePillTone {
  return value != null && value in stageToneVarMap;
}

export function getStageBadgeStyle(stage: StagePillTone): CSSProperties {
  const tone = `var(${stageToneVarMap[stage]})`;

  return {
    backgroundColor: `color-mix(in srgb, ${tone} 16%, var(--background))`,
    borderColor: `color-mix(in srgb, ${tone} 34%, var(--border))`,
    color: tone,
  };
}
