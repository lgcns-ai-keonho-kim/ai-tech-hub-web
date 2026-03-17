/**
 * 목적: 프로필 수정 route의 세션 응답 계약을 검증한다.
 * 설명: 성공 시 nested 세션 payload를 유지하고, 세션 재조립 실패 시 명시적 오류를 반환하는지 확인한다.
 * 적용 패턴: route 계약 테스트 패턴
 * 참조: backend/src/app/api/users/me/profile/route.ts, backend/src/lib/http.ts
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockRequireSessionUser, mockUpdateUserProfile } = vi.hoisted(() => ({
  mockRequireSessionUser: vi.fn(),
  mockUpdateUserProfile: vi.fn(),
}));

vi.mock("@/db/repositories", () => {
  return {
    updateUserProfile: mockUpdateUserProfile,
  };
});

vi.mock("@/lib/http", () => {
  class MockApiError extends Error {
    readonly status: number;
    readonly code: string;

    constructor(shape: { status: number; code: string; message: string }) {
      super(shape.message);
      this.status = shape.status;
      this.code = shape.code;
    }
  }

  return {
    ApiError: MockApiError,
    parseJsonBody: async <T>(request: Request, schema: { parse: (body: unknown) => T }) => {
      return schema.parse(await request.json());
    },
    requireSessionUser: mockRequireSessionUser,
    withErrorBoundary: async <T>(handler: () => Promise<T> | T) => {
      try {
        const data = await handler();
        return Response.json(data);
      } catch (error) {
        if (error instanceof MockApiError) {
          return Response.json(
            {
              code: error.code,
              message: error.message,
            },
            { status: error.status },
          );
        }

        return Response.json(
          {
            code: "internal_error",
            message: "서버에서 요청을 처리하지 못했습니다.",
          },
          { status: 500 },
        );
      }
    },
  };
});

import { PATCH } from "./route";

describe("PATCH /api/users/me/profile", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("성공 시 최신 nested 세션 payload를 반환한다", async () => {
    mockRequireSessionUser.mockResolvedValue({
      id: 2,
      email: "manager@mock.local",
      name: "김하늘",
      accountStatus: "approved",
      globalRole: "user",
      managedProjectIds: [101],
    });
    mockUpdateUserProfile.mockResolvedValue({
      user: {
        id: 2,
        email: "manager@mock.local",
        name: "김하늘 리드",
        accountStatus: "approved",
        globalRole: "user",
      },
      managedProjectIds: [101],
    });

    const response = await PATCH(
      new Request("http://localhost/api/users/me/profile", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "김하늘 리드",
          email: "manager@mock.local",
        }),
      }),
    );

    await expect(response.json()).resolves.toEqual({
      session: {
        user: {
          id: 2,
          email: "manager@mock.local",
          name: "김하늘 리드",
          accountStatus: "approved",
          globalRole: "user",
        },
        managedProjectIds: [101],
      },
    });
  });

  it("세션 재조립 실패는 명시적 500 오류로 반환한다", async () => {
    mockRequireSessionUser.mockResolvedValue({
      id: 2,
      email: "manager@mock.local",
      name: "김하늘",
      accountStatus: "approved",
      globalRole: "user",
      managedProjectIds: [101],
    });
    mockUpdateUserProfile.mockResolvedValue(null);

    const response = await PATCH(
      new Request("http://localhost/api/users/me/profile", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "김하늘 리드",
          email: "manager@mock.local",
        }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: "session_refresh_failed",
      message: "프로필 수정 후 세션 정보를 다시 불러오지 못했습니다.",
    });
  });
});
