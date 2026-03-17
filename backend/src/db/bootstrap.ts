/**
 * 목적: SQLite 데이터베이스를 새 도메인 스키마로 초기화하고 시드한다.
 * 설명: 개발 서버 시작 시 인증, 프로젝트, 자산, 게시판, 알림 테이블과 기본 샘플 데이터를 보장한다.
 * 적용 패턴: 부트스트랩 패턴
 * 참조: backend/src/db/seed-data.ts, backend/src/db/index.ts
 */
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import type Database from "better-sqlite3";

import {
  seedAssetCategories,
  seedAssetComments,
  seedAssetDownloads,
  seedAssetPreferences,
  seedAssets,
  seedAssetStats,
  seedBoardComments,
  seedBoardPosts,
  seedNotifications,
  seedProjectMemberships,
  seedProjects,
  seedUsers,
} from "@/db/seed-data";

const DROP_TABLES_SQL = `
  DROP TABLE IF EXISTS notifications;
  DROP TABLE IF EXISTS board_comments;
  DROP TABLE IF EXISTS board_posts;
  DROP TABLE IF EXISTS asset_comments;
  DROP TABLE IF EXISTS asset_downloads;
  DROP TABLE IF EXISTS asset_preferences;
  DROP TABLE IF EXISTS asset_stats;
  DROP TABLE IF EXISTS assets;
  DROP TABLE IF EXISTS asset_categories;
  DROP TABLE IF EXISTS project_memberships;
  DROP TABLE IF EXISTS projects;
  DROP TABLE IF EXISTS users;

  DROP TABLE IF EXISTS release_note_posts;
  DROP TABLE IF EXISTS post_mortem_posts;
  DROP TABLE IF EXISTS retrospective_posts;
  DROP TABLE IF EXISTS lesson_posts;
  DROP TABLE IF EXISTS posts;
  DROP TABLE IF EXISTS agent_stats;
  DROP TABLE IF EXISTS agents;
  DROP TABLE IF EXISTS categories;
`;

const CREATE_TABLES_SQL = `
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    account_status TEXT NOT NULL,
    global_role TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE project_memberships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE asset_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    project_id INTEGER,
    owner_user_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    attachment_name TEXT,
    attachment_url TEXT,
    external_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    approved_at TEXT,
    approved_by INTEGER,
    rejected_reason TEXT,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (owner_user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
  );

  CREATE TABLE asset_stats (
    asset_id INTEGER PRIMARY KEY,
    view_count INTEGER NOT NULL DEFAULT 0,
    download_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    favorite_count INTEGER NOT NULL DEFAULT 0,
    rating_score REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
  );

  CREATE TABLE asset_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    liked INTEGER NOT NULL DEFAULT 0,
    favorited INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    UNIQUE(asset_id, user_id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE asset_downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE asset_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE board_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    author_user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (author_user_id) REFERENCES users(id)
  );

  CREATE TABLE board_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES board_posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    read_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`;

export function bootstrapDatabase(
  database: Database.Database,
  databaseFilePath: string,
) {
  mkdirSync(dirname(databaseFilePath), { recursive: true });
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = OFF");

  try {
    database.exec(DROP_TABLES_SQL);
    database.exec(CREATE_TABLES_SQL);
    seedDatabase(database);
  } finally {
    database.pragma("foreign_keys = ON");
    database.pragma("wal_checkpoint(TRUNCATE)");
  }
}

function seedDatabase(database: Database.Database) {
  const run = database.transaction(() => {
    const insertUser = database.prepare(`
      INSERT INTO users (id, email, password_hash, name, account_status, global_role, created_at, updated_at)
      VALUES (@id, @email, @passwordHash, @name, @accountStatus, @globalRole, @createdAt, @updatedAt)
    `);
    const insertProject = database.prepare(`
      INSERT INTO projects (id, name, slug, customer_name, summary, created_by, created_at, updated_at)
      VALUES (@id, @name, @slug, @customerName, @summary, @createdBy, @createdAt, @updatedAt)
    `);
    const insertMembership = database.prepare(`
      INSERT INTO project_memberships (id, project_id, user_id, role, created_at)
      VALUES (@id, @projectId, @userId, @role, @createdAt)
    `);
    const insertCategory = database.prepare(`
      INSERT INTO asset_categories (id, kind, name, slug, sort_order)
      VALUES (@id, @kind, @name, @slug, @sortOrder)
    `);
    const insertAsset = database.prepare(`
      INSERT INTO assets (
        id, kind, title, slug, summary, content, category_id, project_id, owner_user_id, status,
        attachment_name, attachment_url, external_url, created_at, updated_at, approved_at, approved_by, rejected_reason
      ) VALUES (
        @id, @kind, @title, @slug, @summary, @content, @categoryId, @projectId, @ownerUserId, @status,
        @attachmentName, @attachmentUrl, @externalUrl, @createdAt, @updatedAt, @approvedAt, @approvedBy, @rejectedReason
      )
    `);
    const insertAssetStat = database.prepare(`
      INSERT INTO asset_stats (asset_id, view_count, download_count, like_count, favorite_count, rating_score)
      VALUES (@assetId, @viewCount, @downloadCount, @likeCount, @favoriteCount, @ratingScore)
    `);
    const insertAssetPreference = database.prepare(`
      INSERT INTO asset_preferences (id, asset_id, user_id, liked, favorited, updated_at)
      VALUES (@id, @assetId, @userId, @liked, @favorited, @updatedAt)
    `);
    const insertAssetDownload = database.prepare(`
      INSERT INTO asset_downloads (id, asset_id, user_id, created_at)
      VALUES (@id, @assetId, @userId, @createdAt)
    `);
    const insertAssetComment = database.prepare(`
      INSERT INTO asset_comments (id, asset_id, user_id, content, created_at, updated_at)
      VALUES (@id, @assetId, @userId, @content, @createdAt, @updatedAt)
    `);
    const insertBoardPost = database.prepare(`
      INSERT INTO board_posts (id, type, author_user_id, title, content, created_at, updated_at)
      VALUES (@id, @type, @authorUserId, @title, @content, @createdAt, @updatedAt)
    `);
    const insertBoardComment = database.prepare(`
      INSERT INTO board_comments (id, post_id, user_id, content, created_at, updated_at)
      VALUES (@id, @postId, @userId, @content, @createdAt, @updatedAt)
    `);
    const insertNotification = database.prepare(`
      INSERT INTO notifications (id, user_id, type, target_type, target_id, message, read_at, created_at)
      VALUES (@id, @userId, @type, @targetType, @targetId, @message, @readAt, @createdAt)
    `);

    seedUsers.forEach((item) => insertUser.run(item));
    seedProjects.forEach((item) => insertProject.run(item));
    seedProjectMemberships.forEach((item) => insertMembership.run(item));
    seedAssetCategories.forEach((item) => insertCategory.run(item));
    seedAssets.forEach((item) => insertAsset.run(item));
    seedAssetStats.forEach((item) => insertAssetStat.run(item));
    seedAssetPreferences.forEach((item) => insertAssetPreference.run(item));
    seedAssetDownloads.forEach((item) => insertAssetDownload.run(item));
    seedAssetComments.forEach((item) => insertAssetComment.run(item));
    seedBoardPosts.forEach((item) => insertBoardPost.run(item));
    seedBoardComments.forEach((item) => insertBoardComment.run(item));
    seedNotifications.forEach((item) => insertNotification.run(item));
  });

  run();
}
