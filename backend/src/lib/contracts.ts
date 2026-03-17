/**
 * 목적: API 입력 검증 규칙과 공통 열거형을 정의한다.
 * 설명: 자산 허브의 인증, 자산, 게시판, 관리자 입력을 Zod 스키마로 고정한다.
 * 적용 패턴: 계약 중심 검증 패턴
 * 참조: backend/src/app/api, backend/src/db/repositories.ts
 */
import { z } from "zod";

export const accountStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const globalRoleSchema = z.enum(["user", "admin"]);
export const projectRoleSchema = z.enum(["user", "manager"]);
export const assetKindSchema = z.enum(["code", "knowledge", "troubleshooting", "lesson"]);
export const assetStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const assetSortSchema = z.enum(["latest", "rating", "downloads"]);
export const boardTypeSchema = z.enum(["notice", "qna"]);
export const notificationTypeSchema = z.enum([
  "asset-approved",
  "asset-rejected",
  "asset-comment",
  "qna-comment",
]);

export const loginBodySchema = z.object({
  email: z.string().trim().email("올바른 이메일을 입력해 주세요."),
  password: z.string().trim().min(6, "비밀번호는 6자 이상이어야 합니다."),
});

export const signupBodySchema = loginBodySchema.extend({
  name: z.string().trim().min(2, "이름은 2자 이상이어야 합니다.").max(40),
});

export const updateProfileBodySchema = z.object({
  name: z.string().trim().min(2, "이름은 2자 이상이어야 합니다.").max(40),
  email: z.string().trim().email("올바른 이메일을 입력해 주세요."),
});

export const updatePasswordBodySchema = z.object({
  currentPassword: z.string().trim().min(6, "현재 비밀번호를 입력해 주세요."),
  nextPassword: z.string().trim().min(6, "새 비밀번호는 6자 이상이어야 합니다."),
});

export const createAssetBodySchema = z.object({
  kind: assetKindSchema,
  title: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "slug 형식이 올바르지 않습니다."),
  summary: z.string().trim().min(10).max(400),
  content: z.string().trim().min(20).max(20000),
  categoryId: z.coerce.number().int().positive(),
  projectId: z.coerce.number().int().positive().nullable(),
  attachmentName: z.string().trim().max(160).nullable(),
  attachmentUrl: z.string().trim().max(400).nullable(),
  externalUrl: z.string().trim().max(400).nullable(),
});

export const createCommentBodySchema = z.object({
  content: z.string().trim().min(2, "댓글은 2자 이상이어야 합니다.").max(2000),
});

export const createBoardPostBodySchema = z.object({
  type: boardTypeSchema,
  title: z.string().trim().min(2).max(120),
  content: z.string().trim().min(10).max(10000),
});

export const createProjectBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "slug 형식이 올바르지 않습니다."),
  customerName: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(5).max(400),
});

export const createCategoryBodySchema = z.object({
  kind: assetKindSchema,
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "slug 형식이 올바르지 않습니다."),
  sortOrder: z.coerce.number().int().min(1).max(999),
});

export const rejectReasonBodySchema = z.object({
  reason: z.string().trim().min(2, "거절 사유를 입력해 주세요.").max(400),
});

export const projectMembershipBodySchema = z.object({
  projectId: z.coerce.number().int().positive(),
  role: projectRoleSchema,
});

export const projectMembershipRemoveBodySchema = z.object({
  projectId: z.coerce.number().int().positive(),
});

export const categoryQuerySchema = z.object({
  kind: assetKindSchema.optional(),
});

export const listProjectsQuerySchema = z.object({
  query: z.string().trim().optional(),
});

export const listAssetsQuerySchema = z.object({
  kind: assetKindSchema.optional(),
  sort: assetSortSchema.default("latest"),
  query: z.string().trim().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  projectId: z.coerce.number().int().positive().optional(),
  status: assetStatusSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(60).optional(),
});
