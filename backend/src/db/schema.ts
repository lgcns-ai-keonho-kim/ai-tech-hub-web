/**
 * 목적: 통합 자산 허브용 SQLite 스키마를 정의한다.
 * 설명: 인증, 프로젝트, 자산, 게시판, 알림 도메인의 테이블 구조를 한 곳에서 관리한다.
 * 적용 패턴: 스키마 정의 패턴
 * 참조: backend/src/db/bootstrap.ts, backend/src/db/index.ts
 */
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const accountStatuses = ["pending", "approved", "rejected"] as const;
export const globalRoles = ["user", "admin"] as const;
export const projectRoles = ["user", "manager"] as const;
export const assetKinds = ["code", "knowledge", "troubleshooting", "lesson"] as const;
export const assetStatuses = ["pending", "approved", "rejected"] as const;
export const boardTypes = ["notice", "qna"] as const;
export const notificationTypes = [
  "asset-approved",
  "asset-rejected",
  "asset-comment",
  "qna-comment",
] as const;

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  accountStatus: text("account_status", { enum: accountStatuses }).notNull(),
  globalRole: text("global_role", { enum: globalRoles }).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  customerName: text("customer_name").notNull(),
  summary: text("summary").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const projectMemberships = sqliteTable(
  "project_memberships",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id").notNull().references(() => projects.id),
    userId: integer("user_id").notNull().references(() => users.id),
    role: text("role", { enum: projectRoles }).notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    projectUserUnique: uniqueIndex("project_memberships_project_user_unique").on(
      table.projectId,
      table.userId,
    ),
  }),
);

export const assetCategories = sqliteTable("asset_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: assetKinds }).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull(),
});

export const assets = sqliteTable("assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: assetKinds }).notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").notNull().references(() => assetCategories.id),
  projectId: integer("project_id").references(() => projects.id),
  ownerUserId: integer("owner_user_id").notNull().references(() => users.id),
  status: text("status", { enum: assetStatuses }).notNull(),
  attachmentName: text("attachment_name"),
  attachmentUrl: text("attachment_url"),
  externalUrl: text("external_url"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  approvedAt: text("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id),
  rejectedReason: text("rejected_reason"),
});

export const assetStats = sqliteTable("asset_stats", {
  assetId: integer("asset_id").primaryKey().references(() => assets.id),
  viewCount: integer("view_count").notNull().default(0),
  downloadCount: integer("download_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  favoriteCount: integer("favorite_count").notNull().default(0),
  ratingScore: real("rating_score").notNull().default(0),
});

export const assetPreferences = sqliteTable(
  "asset_preferences",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    assetId: integer("asset_id").notNull().references(() => assets.id),
    userId: integer("user_id").notNull().references(() => users.id),
    liked: integer("liked", { mode: "boolean" }).notNull().default(false),
    favorited: integer("favorited", { mode: "boolean" }).notNull().default(false),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    assetUserUnique: uniqueIndex("asset_preferences_asset_user_unique").on(
      table.assetId,
      table.userId,
    ),
  }),
);

export const assetDownloads = sqliteTable("asset_downloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(),
});

export const assetComments = sqliteTable("asset_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const boardPosts = sqliteTable("board_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: boardTypes }).notNull(),
  authorUserId: integer("author_user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const boardComments = sqliteTable("board_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").notNull().references(() => boardPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type", { enum: notificationTypes }).notNull(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  message: text("message").notNull(),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull(),
});
