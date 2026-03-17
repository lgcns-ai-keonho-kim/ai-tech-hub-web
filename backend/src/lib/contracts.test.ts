/**
 * 목적: 자산 허브 계약 스키마의 핵심 검증 규칙을 보장한다.
 * 설명: 입력 검증이 흔들리지 않도록 성공/실패 경로를 최소 범위로 확인한다.
 * 적용 패턴: 계약 테스트 패턴
 * 참조: backend/src/lib/contracts.ts
 */
import { describe, expect, it } from "vitest";

import {
  createAssetBodySchema,
  createCategoryBodySchema,
  createProjectBodySchema,
  loginBodySchema,
  projectMembershipBodySchema,
} from "@/lib/contracts";

describe("contracts", () => {
  it("로그인 입력은 이메일과 비밀번호를 검증한다", () => {
    const result = loginBodySchema.safeParse({
      email: "user@mock.local",
      password: "user123!",
    });

    expect(result.success).toBe(true);
  });

  it("프로젝트 연결 자산 입력을 허용한다", () => {
    const result = createAssetBodySchema.safeParse({
      kind: "knowledge",
      title: "요구사항 정의서",
      slug: "requirements-spec",
      summary: "프로젝트 요구사항을 정리한 문서",
      content: "충분히 긴 본문 내용입니다. 최소 길이를 만족해야 합니다.",
      categoryId: 3,
      projectId: 1,
      attachmentName: "requirements.pdf",
      attachmentUrl: "https://mock.local/docs/requirements.pdf",
      externalUrl: null,
    });

    expect(result.success).toBe(true);
  });

  it("잘못된 slug는 프로젝트 생성에서 거부한다", () => {
    const result = createProjectBodySchema.safeParse({
      name: "프로젝트",
      slug: "잘못된 slug",
      customerName: "한빛손해보험",
      summary: "설명은 충분히 길어야 합니다.",
    });

    expect(result.success).toBe(false);
  });

  it("카테고리 정렬 순서는 1 이상이어야 한다", () => {
    const result = createCategoryBodySchema.safeParse({
      kind: "lesson",
      name: "회고",
      slug: "retrospective",
      sortOrder: 0,
    });

    expect(result.success).toBe(false);
  });

  it("프로젝트 멤버십은 user와 manager만 허용한다", () => {
    const result = projectMembershipBodySchema.safeParse({
      projectId: 1,
      role: "manager",
    });

    expect(result.success).toBe(true);
  });
});
