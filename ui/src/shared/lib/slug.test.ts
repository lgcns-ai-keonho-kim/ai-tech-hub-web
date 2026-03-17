/**
 * 목적: slug 생성 규칙이 기대한 문자열 정규화를 수행하는지 검증한다.
 * 설명: 관리자 입력 폼의 자동 slug 생성이 일관된 값을 반환하도록 보장한다.
 * 적용 패턴: 유틸리티 테스트 패턴
 * 참조: ui/src/shared/lib/slug.ts
 */
import { describe, expect, it } from "vitest";

import { toSlug } from "@/shared/lib/slug";

describe("toSlug", () => {
  it("영문, 숫자, 공백 조합을 하이픈 slug로 변환한다", () => {
    expect(toSlug("Codex CLI 2")).toBe("codex-cli-2");
  });

  it("허용되지 않는 문자를 제거한다", () => {
    expect(toSlug("Claude Code!@#")).toBe("claude-code");
  });
});
