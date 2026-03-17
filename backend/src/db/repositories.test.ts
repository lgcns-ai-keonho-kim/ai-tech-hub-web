/**
 * 목적: 저장소 계층의 핵심 응답 계약을 고정한다.
 * 설명: 세션, 카테고리, 게시판, 대시보드 조회 shape가 변경되지 않도록 저장소 반환 구조를 검증한다.
 * 적용 패턴: 저장소 계약 테스트 패턴
 * 참조: backend/src/db/repositories.ts, backend/src/lib/http.ts
 */
import { describe, expect, it } from "vitest";

import {
  createCategory,
  createAuthenticatedUser,
  createSessionPayload,
  getAdminDashboard,
  listAssetCategories,
  listBoardPosts,
  listUsersForAdmin,
  loginWithEmail,
  type SessionIdentity,
} from "@/db/repositories";

const sessionIdentity: SessionIdentity = {
  id: 2,
  email: "manager@mock.local",
  name: "김하늘",
  accountStatus: "approved",
  globalRole: "user",
};

describe("repositories session contracts", () => {
  it("응답용 세션 payload를 nested 구조로 조립한다", () => {
    const session = createSessionPayload(sessionIdentity, [101, 202]);

    expect(session).toEqual({
      user: sessionIdentity,
      managedProjectIds: [101, 202],
    });
  });

  it("내부 인증 사용자를 flat 구조로 조립한다", () => {
    const currentUser = createAuthenticatedUser(sessionIdentity, [101]);

    expect(currentUser).toEqual({
      ...sessionIdentity,
      managedProjectIds: [101],
    });
  });

  it("잘못된 로그인은 null을 반환한다", async () => {
    await expect(loginWithEmail("missing@mock.local", "wrong-password")).resolves.toBeNull();
  });

  it("관리자 사용자 목록은 프로젝트 이름과 멤버십 계약을 유지한다", () => {
    const users = listUsersForAdmin();
    const managerUser = users.find((user) => user.email === "manager@mock.local");

    expect(managerUser).toBeDefined();
    expect(managerUser?.managedProjects.every((projectName) => typeof projectName === "string")).toBe(true);
    expect(managerUser?.managedProjects.length).toBeGreaterThan(0);
    expect(managerUser?.projectMemberships.every((membership) => typeof membership.projectId === "number")).toBe(true);
    expect(managerUser?.projectMemberships.every((membership) => typeof membership.projectName === "string")).toBe(true);
    expect(managerUser?.projectMemberships.every((membership) => membership.role === "user" || membership.role === "manager")).toBe(true);
  });
});

describe("repositories query contracts", () => {
  it("카테고리 목록은 관리자와 공개 API가 기대하는 shape를 유지한다", () => {
    const categories = listAssetCategories("code");

    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((category) => category.kind === "code")).toBe(true);
    expect(categories.every((category) => typeof category.id === "number")).toBe(true);
    expect(categories.every((category) => typeof category.name === "string")).toBe(true);
    expect(categories.every((category) => typeof category.slug === "string")).toBe(true);
    expect(categories.every((category) => typeof category.sortOrder === "number")).toBe(true);
  });

  it("카테고리 생성은 생성 직후 같은 shape의 행을 반환한다", async () => {
    const slug = `codex-category-${Date.now()}`;

    const category = await createCategory({
      kind: "knowledge",
      name: "코덱스 테스트 카테고리",
      slug,
      sortOrder: 999,
    });

    expect(category).not.toBeNull();
    expect(category).toMatchObject({
      kind: "knowledge",
      name: "코덱스 테스트 카테고리",
      slug,
      sortOrder: 999,
    });
    expect(typeof category?.id).toBe("number");
  });

  it("게시판 목록은 댓글 수를 포함한 요약 shape를 유지한다", () => {
    const posts = listBoardPosts("notice");

    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((post) => post.type === "notice")).toBe(true);
    expect(posts.every((post) => typeof post.id === "number")).toBe(true);
    expect(posts.every((post) => typeof post.title === "string")).toBe(true);
    expect(posts.every((post) => typeof post.contentPreview === "string")).toBe(true);
    expect(posts.every((post) => typeof post.commentCount === "number")).toBe(true);
  });

  it("관리자 대시보드는 카테고리 집계 shape를 유지한다", () => {
    const dashboard = getAdminDashboard();

    expect(dashboard.assetsByCategory.length).toBeGreaterThan(0);
    expect(dashboard.assetsByCategory.every((item) => typeof item.categoryId === "number")).toBe(true);
    expect(dashboard.assetsByCategory.every((item) => typeof item.categoryName === "string")).toBe(true);
    expect(dashboard.assetsByCategory.every((item) => typeof item.count === "number")).toBe(true);
  });
});
