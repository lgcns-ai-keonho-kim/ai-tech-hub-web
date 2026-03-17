/**
 * 목적: API 응답 포맷, 예외 처리, 요청 사용자 해석을 공통화한다.
 * 설명: JSON 파싱, Zod 오류, 인증/권한 오류, 헤더 기반 Mock 세션 조회를 같은 규칙으로 처리한다.
 * 적용 패턴: 오류 경계 패턴
 * 참조: backend/src/app/api, backend/src/db/repositories.ts
 */
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

import {
  createAuthenticatedUser,
  getManagedProjectIdsByUserId,
  getUserById,
  type AuthenticatedUser,
} from "@/db/repositories";

type ApiErrorShape = {
  status: number;
  code: string;
  message: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.status = shape.status;
    this.code = shape.code;
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(error: ApiErrorShape, init?: ResponseInit) {
  return NextResponse.json(
    {
      message: error.message,
      code: error.code,
    },
    {
      status: error.status,
      ...init,
    },
  );
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ApiError({
      status: 400,
      code: "invalid_json",
      message: "JSON 본문을 해석할 수 없습니다.",
    });
  }

  return schema.parse(body);
}

export async function withErrorBoundary<T>(handler: () => Promise<T> | T) {
  try {
    const data = await handler();
    return ok(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return fail({
        status: error.status,
        code: error.code,
        message: error.message,
      });
    }

    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      return fail({
        status: 400,
        code: "validation_error",
        message: firstIssue?.message ?? "입력 검증에 실패했습니다.",
      });
    }

    return fail({
      status: 500,
      code: "internal_error",
      message: "서버에서 요청을 처리하지 못했습니다.",
    });
  }
}

export async function requireSessionUser(request: Request): Promise<AuthenticatedUser> {
  const userId = Number(request.headers.get("x-user-id"));

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError({
      status: 401,
      code: "unauthorized",
      message: "로그인이 필요합니다.",
    });
  }

  // 내부 인증 객체는 flat 구조를 유지하고, 응답용 세션 payload와 구분한다.
  const sessionIdentity = await getUserById(userId);

  if (!sessionIdentity) {
    throw new ApiError({
      status: 401,
      code: "session_user_not_found",
      message: "세션 사용자를 찾을 수 없습니다.",
    });
  }

  if (sessionIdentity.accountStatus !== "approved") {
    throw new ApiError({
      status: 403,
      code: "account_not_approved",
      message: "승인된 계정만 접근할 수 있습니다.",
    });
  }

  const managedProjectIds = await getManagedProjectIdsByUserId(sessionIdentity.id);
  return createAuthenticatedUser(sessionIdentity, managedProjectIds);
}

export function getOptionalSessionUserId(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  return Number.isInteger(userId) && userId > 0 ? userId : undefined;
}

export async function requireAdminUser(request: Request): Promise<AuthenticatedUser> {
  const currentUser = await requireSessionUser(request);

  if (currentUser.globalRole !== "admin") {
    throw new ApiError({
      status: 403,
      code: "admin_required",
      message: "관리자 권한이 필요합니다.",
    });
  }

  return currentUser;
}

export async function requireManagerForProject(
  request: Request,
  projectId: number,
): Promise<AuthenticatedUser> {
  const currentUser = await requireSessionUser(request);

  if (!currentUser.managedProjectIds.includes(projectId)) {
    throw new ApiError({
      status: 403,
      code: "project_manager_required",
      message: "프로젝트 매니저 권한이 필요합니다.",
    });
  }

  return currentUser;
}
