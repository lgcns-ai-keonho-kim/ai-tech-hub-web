/**
 * 목적: 통합 자산 허브 도메인의 DB 접근 로직을 캡슐화한다.
 * 설명: 인증, 자산, 프로젝트, 게시판, 알림, 관리자 기능이 같은 저장소 계층을 통해 SQLite에 접근하게 한다.
 * 적용 패턴: Repository 패턴
 * 참조: backend/src/app/api, backend/src/lib/http.ts
 */
import { rawDatabase } from "@/db";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  accountStatus: "pending" | "approved" | "rejected";
  globalRole: "user" | "admin";
  managedProjectIds: number[];
};

type AssetRow = {
  id: number;
  kind: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  projectId: number | null;
  projectName: string | null;
  ownerUserId: number;
  ownerName: string;
  status: string;
  attachmentName: string | null;
  attachmentUrl: string | null;
  externalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  rejectedReason: string | null;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  favoriteCount: number;
  ratingScore: number;
  likedByMe?: number;
  favoritedByMe?: number;
  downloadedByMe?: number;
};

type ProjectCountRow = {
  projectId: number;
  projectName: string;
  count: number;
};

type HomeDashboardAssetAggregateRow = {
  kind: string;
  totalAssets: number;
  todayAssets: number;
  yesterdayAssets: number;
  pendingAssets: number;
};

type HomeDashboardCommentAggregateRow = {
  kind: string;
  todayComments: number;
  yesterdayComments: number;
};

const homeDashboardKinds = ["code", "knowledge", "troubleshooting", "lesson"] as const;

function nowIso() {
  return new Date().toISOString();
}

function mapSessionUser(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    email: String(row.email),
    name: String(row.name),
    accountStatus: row.account_status as SessionUser["accountStatus"],
    globalRole: row.global_role as SessionUser["globalRole"],
  };
}

function mapAssetRow(row: AssetRow) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    projectId: row.projectId,
    projectName: row.projectName,
    ownerUserId: row.ownerUserId,
    ownerName: row.ownerName,
    status: row.status,
    attachmentName: row.attachmentName,
    attachmentUrl: row.attachmentUrl,
    externalUrl: row.externalUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    approvedAt: row.approvedAt,
    rejectedReason: row.rejectedReason,
    ratingScore: Number(row.ratingScore ?? 0),
    viewCount: Number(row.viewCount ?? 0),
    downloadCount: Number(row.downloadCount ?? 0),
    likeCount: Number(row.likeCount ?? 0),
    favoriteCount: Number(row.favoriteCount ?? 0),
    likedByMe: Boolean(row.likedByMe),
    favoritedByMe: Boolean(row.favoritedByMe),
    downloadedByMe: Boolean(row.downloadedByMe),
  };
}

function assetSelectSql(currentUserId?: number) {
  return `
    SELECT
      a.id AS id,
      a.kind AS kind,
      a.title AS title,
      a.slug AS slug,
      a.summary AS summary,
      a.content AS content,
      c.id AS categoryId,
      c.name AS categoryName,
      c.slug AS categorySlug,
      p.id AS projectId,
      p.name AS projectName,
      u.id AS ownerUserId,
      u.name AS ownerName,
      a.status AS status,
      a.attachment_name AS attachmentName,
      a.attachment_url AS attachmentUrl,
      a.external_url AS externalUrl,
      a.created_at AS createdAt,
      a.updated_at AS updatedAt,
      a.approved_at AS approvedAt,
      a.rejected_reason AS rejectedReason,
      s.view_count AS viewCount,
      s.download_count AS downloadCount,
      s.like_count AS likeCount,
      s.favorite_count AS favoriteCount,
      s.rating_score AS ratingScore
      ${currentUserId ? ", COALESCE(pref.liked, 0) AS likedByMe, COALESCE(pref.favorited, 0) AS favoritedByMe, CASE WHEN dl.id IS NULL THEN 0 ELSE 1 END AS downloadedByMe" : ""}
    FROM assets a
    INNER JOIN asset_categories c ON c.id = a.category_id
    INNER JOIN users u ON u.id = a.owner_user_id
    LEFT JOIN projects p ON p.id = a.project_id
    INNER JOIN asset_stats s ON s.asset_id = a.id
    ${currentUserId ? `LEFT JOIN asset_preferences pref ON pref.asset_id = a.id AND pref.user_id = ${currentUserId}
    LEFT JOIN (
      SELECT DISTINCT asset_id, user_id, id FROM asset_downloads WHERE user_id = ${currentUserId}
    ) dl ON dl.asset_id = a.id` : ""}
  `;
}

export async function getUserById(userId: number) {
  const row = rawDatabase
    .prepare("SELECT id, email, name, account_status, global_role FROM users WHERE id = ? LIMIT 1")
    .get(userId) as Record<string, unknown> | undefined;

  return row ? mapSessionUser(row) : null;
}

export async function getManagedProjectIdsByUserId(userId: number) {
  const rows = rawDatabase
    .prepare("SELECT project_id FROM project_memberships WHERE user_id = ? AND role = 'manager'")
    .all(userId) as Array<{ project_id: number }>;

  return rows.map((row) => row.project_id);
}

export async function loginWithEmail(email: string, password: string) {
  const row = rawDatabase
    .prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
    .get(email.trim()) as Record<string, unknown> | undefined;

  if (!row || String(row.password_hash) !== password.trim()) {
    return null;
  }

  const user = mapSessionUser(row);
  const managedProjectIds = await getManagedProjectIdsByUserId(user.id);

  return {
    user,
    managedProjectIds,
  };
}

export async function createPendingUser(input: { email: string; password: string; name: string }) {
  const exists = rawDatabase
    .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
    .get(input.email.trim()) as { id: number } | undefined;

  if (exists) {
    return "duplicate" as const;
  }

  const now = nowIso();
  rawDatabase
    .prepare(`
      INSERT INTO users (email, password_hash, name, account_status, global_role, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', 'user', ?, ?)
    `)
    .run(input.email.trim(), input.password.trim(), input.name.trim(), now, now);

  return "created" as const;
}

export async function updateUserProfile(userId: number, input: { name: string; email: string }) {
  rawDatabase
    .prepare("UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?")
    .run(input.name.trim(), input.email.trim(), nowIso(), userId);

  const user = await getUserById(userId);
  const managedProjectIds = await getManagedProjectIdsByUserId(userId);

  return user ? { user, managedProjectIds } : null;
}

export async function updateUserPassword(userId: number, input: { currentPassword: string; nextPassword: string }) {
  const row = rawDatabase
    .prepare("SELECT password_hash FROM users WHERE id = ? LIMIT 1")
    .get(userId) as { password_hash: string } | undefined;

  if (!row || row.password_hash !== input.currentPassword) {
    return "invalid_current_password" as const;
  }

  rawDatabase
    .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
    .run(input.nextPassword.trim(), nowIso(), userId);

  return "updated" as const;
}

export function listAssetCategories(kind?: string) {
  const rows = kind
    ? rawDatabase
        .prepare("SELECT id, kind, name, slug, sort_order AS sortOrder FROM asset_categories WHERE kind = ? ORDER BY sort_order, id")
        .all(kind)
    : rawDatabase
        .prepare("SELECT id, kind, name, slug, sort_order AS sortOrder FROM asset_categories ORDER BY kind, sort_order, id")
        .all();

  return rows;
}

export async function hasAssetCategory(categoryId: number) {
  const row = rawDatabase.prepare("SELECT id FROM asset_categories WHERE id = ? LIMIT 1").get(categoryId);
  return Boolean(row);
}

export async function hasProject(projectId: number) {
  const row = rawDatabase.prepare("SELECT id FROM projects WHERE id = ? LIMIT 1").get(projectId);
  return Boolean(row);
}

export async function isProjectMember(projectId: number, userId: number) {
  const row = rawDatabase
    .prepare("SELECT id FROM project_memberships WHERE project_id = ? AND user_id = ? LIMIT 1")
    .get(projectId, userId);
  return Boolean(row);
}

export function listAssets(input: {
  currentUserId?: number;
  kind?: string;
  sort: "latest" | "rating" | "downloads";
  query?: string;
  categoryId?: number;
  projectId?: number;
  status?: string;
}) {
  const conditions = ["1 = 1"];
  const params: Array<string | number> = [];

  if (input.kind) {
    conditions.push("a.kind = ?");
    params.push(input.kind);
  }

  if (input.categoryId) {
    conditions.push("a.category_id = ?");
    params.push(input.categoryId);
  }

  if (input.projectId) {
    conditions.push("a.project_id = ?");
    params.push(input.projectId);
  }

  if (input.status) {
    conditions.push("a.status = ?");
    params.push(input.status);
  } else {
    conditions.push("a.status = 'approved'");
  }

  if (input.query?.trim()) {
    conditions.push("(a.title LIKE ? OR a.summary LIKE ? OR u.name LIKE ?)");
    const pattern = `%${input.query.trim()}%`;
    params.push(pattern, pattern, pattern);
  }

  const orderBy =
    input.sort === "rating"
      ? "s.rating_score DESC, a.id DESC"
      : input.sort === "downloads"
        ? "s.download_count DESC, a.id DESC"
        : "a.created_at DESC, a.id DESC";

  const rows = rawDatabase
    .prepare(
      `${assetSelectSql(input.currentUserId)}
       WHERE ${conditions.join(" AND ")}
       ORDER BY ${orderBy}`,
    )
    .all(...params) as AssetRow[];

  return rows.map((row) => mapAssetRow(row));
}

export function listAssetsPaginated(input: {
  currentUserId?: number;
  kind?: string;
  sort: "latest" | "rating" | "downloads";
  query?: string;
  categoryId?: number;
  projectId?: number;
  status?: string;
  page: number;
  pageSize: number;
}) {
  const allAssets = listAssets(input);
  const totalCount = allAssets.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / input.pageSize));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const startIndex = (page - 1) * input.pageSize;

  return {
    assets: allAssets.slice(startIndex, startIndex + input.pageSize),
    pagination: {
      page,
      pageSize: input.pageSize,
      totalCount,
      totalPages,
    },
  };
}

export async function getAssetById(assetId: number, currentUserId?: number) {
  const row = rawDatabase
    .prepare(
      `${assetSelectSql(currentUserId)} WHERE a.id = ? LIMIT 1`,
    )
    .get(assetId) as AssetRow | undefined;

  return row ? mapAssetRow(row) : null;
}

export async function createAsset(currentUserId: number, input: {
  kind: "code" | "knowledge" | "troubleshooting" | "lesson";
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: number;
  projectId: number | null;
  attachmentName: string | null;
  attachmentUrl: string | null;
  externalUrl: string | null;
}) {
  const now = nowIso();
  const status = input.kind === "code" ? "approved" : "pending";
  const approvedAt = status === "approved" ? now : null;
  const approvedBy = status === "approved" ? currentUserId : null;

  const result = rawDatabase
    .prepare(`
      INSERT INTO assets (
        kind, title, slug, summary, content, category_id, project_id, owner_user_id, status,
        attachment_name, attachment_url, external_url, created_at, updated_at, approved_at, approved_by, rejected_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `)
    .run(
      input.kind,
      input.title.trim(),
      input.slug.trim(),
      input.summary.trim(),
      input.content.trim(),
      input.categoryId,
      input.projectId,
      currentUserId,
      status,
      input.attachmentName,
      input.attachmentUrl,
      input.externalUrl,
      now,
      now,
      approvedAt,
      approvedBy,
    );

  const assetId = Number(result.lastInsertRowid);
  rawDatabase
    .prepare(`
      INSERT INTO asset_stats (asset_id, view_count, download_count, like_count, favorite_count, rating_score)
      VALUES (?, 0, 0, 0, 0, ?)
    `)
    .run(assetId, input.kind === "code" ? 4.8 : 4.2);

  if (status === "pending" && input.projectId) {
    const managerRows = rawDatabase
      .prepare("SELECT user_id FROM project_memberships WHERE project_id = ? AND role = 'manager'")
      .all(input.projectId) as Array<{ user_id: number }>;
    managerRows.forEach((row) => {
      createNotification({
        userId: row.user_id,
        type: "asset-comment",
        targetType: "asset",
        targetId: assetId,
        message: `${input.title} 자산이 승인 대기열에 등록되었습니다.`,
      });
    });
  }

  return getAssetById(assetId, currentUserId);
}

export function listAssetComments(assetId: number) {
  return rawDatabase
    .prepare(`
      SELECT c.id, c.asset_id AS assetId, c.user_id AS userId, u.name AS userName, c.content, c.created_at AS createdAt, c.updated_at AS updatedAt
      FROM asset_comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.asset_id = ?
      ORDER BY c.created_at ASC, c.id ASC
    `)
    .all(assetId);
}

export async function createAssetComment(currentUserId: number, assetId: number, content: string) {
  const now = nowIso();
  const result = rawDatabase
    .prepare("INSERT INTO asset_comments (asset_id, user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
    .run(assetId, currentUserId, content.trim(), now, now);
  const commentId = Number(result.lastInsertRowid);

  const asset = rawDatabase
    .prepare("SELECT owner_user_id AS ownerUserId, title FROM assets WHERE id = ? LIMIT 1")
    .get(assetId) as { ownerUserId: number; title: string } | undefined;
  if (asset && asset.ownerUserId !== currentUserId) {
    createNotification({
      userId: asset.ownerUserId,
      type: "asset-comment",
      targetType: "asset",
      targetId: assetId,
      message: `${asset.title} 자산에 새 댓글이 등록되었습니다.`,
    });
  }

  return rawDatabase
    .prepare(`
      SELECT c.id, c.asset_id AS assetId, c.user_id AS userId, u.name AS userName, c.content, c.created_at AS createdAt, c.updated_at AS updatedAt
      FROM asset_comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.id = ?
      LIMIT 1
    `)
    .get(commentId);
}

function ensurePreferenceRow(assetId: number, userId: number) {
  rawDatabase
    .prepare(`
      INSERT INTO asset_preferences (asset_id, user_id, liked, favorited, updated_at)
      VALUES (?, ?, 0, 0, ?)
      ON CONFLICT(asset_id, user_id) DO NOTHING
    `)
    .run(assetId, userId, nowIso());
}

export async function toggleLikeAsset(assetId: number, userId: number) {
  ensurePreferenceRow(assetId, userId);
  rawDatabase
    .prepare(`
      UPDATE asset_preferences
      SET liked = CASE WHEN liked = 1 THEN 0 ELSE 1 END, updated_at = ?
      WHERE asset_id = ? AND user_id = ?
    `)
    .run(nowIso(), assetId, userId);
  rawDatabase
    .prepare(`
      UPDATE asset_stats
      SET like_count = (
        SELECT COUNT(*) FROM asset_preferences WHERE asset_id = ? AND liked = 1
      )
      WHERE asset_id = ?
    `)
    .run(assetId, assetId);
}

export async function toggleFavoriteAsset(assetId: number, userId: number) {
  ensurePreferenceRow(assetId, userId);
  rawDatabase
    .prepare(`
      UPDATE asset_preferences
      SET favorited = CASE WHEN favorited = 1 THEN 0 ELSE 1 END, updated_at = ?
      WHERE asset_id = ? AND user_id = ?
    `)
    .run(nowIso(), assetId, userId);
  rawDatabase
    .prepare(`
      UPDATE asset_stats
      SET favorite_count = (
        SELECT COUNT(*) FROM asset_preferences WHERE asset_id = ? AND favorited = 1
      )
      WHERE asset_id = ?
    `)
    .run(assetId, assetId);
}

export async function recordAssetDownload(assetId: number, userId: number) {
  rawDatabase
    .prepare("INSERT INTO asset_downloads (asset_id, user_id, created_at) VALUES (?, ?, ?)")
    .run(assetId, userId, nowIso());
  rawDatabase
    .prepare("UPDATE asset_stats SET download_count = download_count + 1 WHERE asset_id = ?")
    .run(assetId);
}

const projectStageOrder = [
  "proposal",
  "analysis",
  "design",
  "development",
  "test",
  "operations",
] as const;

type ProjectStage = (typeof projectStageOrder)[number];

function createEmptyProjectStageCounts(): Record<ProjectStage, number> {
  return {
    proposal: 0,
    analysis: 0,
    design: 0,
    development: 0,
    test: 0,
    operations: 0,
  };
}

export function listProjects(query?: string) {
  const normalizedQuery = query?.trim() ? `%${query.trim()}%` : null;
  const rows = rawDatabase
    .prepare(`
      SELECT p.id, p.name, p.slug, p.customer_name AS customerName, p.summary
      FROM projects p
      WHERE (
        ? IS NULL
        OR p.name LIKE ?
        OR p.summary LIKE ?
        OR p.customer_name LIKE ?
        OR EXISTS (
          SELECT 1
          FROM project_memberships pm
          INNER JOIN users u ON u.id = pm.user_id
          WHERE pm.project_id = p.id
            AND pm.role = 'manager'
            AND u.name LIKE ?
        )
      )
      ORDER BY p.created_at DESC, p.id DESC
    `)
    .all(
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
      normalizedQuery,
    ) as Array<{ id: number; name: string; slug: string; customerName: string; summary: string }>;

  if (rows.length === 0) {
    return [];
  }

  const projectIds = rows.map((project) => project.id);
  const placeholders = projectIds.map(() => "?").join(", ");
  const managerRows = rawDatabase
    .prepare(`
      SELECT pm.project_id AS projectId, u.name
      FROM project_memberships pm
      INNER JOIN users u ON u.id = pm.user_id
      WHERE pm.role = 'manager' AND pm.project_id IN (${placeholders})
      ORDER BY pm.id
    `)
    .all(...projectIds) as Array<{ projectId: number; name: string }>;
  const assetCountRows = rawDatabase
    .prepare(`
      SELECT a.project_id AS projectId, a.kind, COUNT(*) AS count
      FROM assets a
      WHERE a.project_id IN (${placeholders}) AND a.status = 'approved'
      GROUP BY a.project_id, a.kind
    `)
    .all(...projectIds) as Array<{ projectId: number; kind: string; count: number }>;
  const stageRows = rawDatabase
    .prepare(`
      SELECT a.project_id AS projectId, c.slug AS stage, COUNT(*) AS count
      FROM assets a
      INNER JOIN asset_categories c ON c.id = a.category_id
      WHERE a.project_id IN (${placeholders})
        AND a.kind = 'knowledge'
        AND a.status = 'approved'
        AND c.slug IN (${projectStageOrder.map(() => "?").join(", ")})
      GROUP BY a.project_id, c.slug
    `)
    .all(...projectIds, ...projectStageOrder) as Array<{ projectId: number; stage: ProjectStage; count: number }>;

  const managerMap = new Map<number, string[]>();
  managerRows.forEach((row) => {
    const names = managerMap.get(row.projectId) ?? [];
    names.push(row.name);
    managerMap.set(row.projectId, names);
  });

  const assetCountMap = new Map<number, Record<string, number>>();
  assetCountRows.forEach((row) => {
    const counts = assetCountMap.get(row.projectId) ?? {};
    counts[row.kind] = row.count;
    assetCountMap.set(row.projectId, counts);
  });

  const stageCountMap = new Map<number, Record<ProjectStage, number>>();
  stageRows.forEach((row) => {
    const counts = stageCountMap.get(row.projectId) ?? createEmptyProjectStageCounts();
    counts[row.stage] = row.count;
    stageCountMap.set(row.projectId, counts);
  });

  return rows.map((project) => {
    const stageCounts = stageCountMap.get(project.id) ?? createEmptyProjectStageCounts();
    const currentStage =
      [...projectStageOrder].reverse().find((stage) => stageCounts[stage] > 0) ?? null;

    return {
      ...project,
      managerNames: managerMap.get(project.id) ?? [],
      assetCounts: assetCountMap.get(project.id) ?? {},
      stageCounts,
      currentStage,
    };
  });
}

export async function getProjectById(projectId: number) {
  const project = listProjects().find((item) => item.id === projectId) ?? null;
  if (!project) {
    return null;
  }
  const assets = listAssets({
    projectId,
    sort: "latest",
  });
  return { project, assets };
}

export function listMyAssets(userId: number) {
  const rows = rawDatabase
    .prepare(`${assetSelectSql(userId)} WHERE a.owner_user_id = ? ORDER BY a.created_at DESC, a.id DESC`)
    .all(userId) as AssetRow[];
  return rows.map((row) => mapAssetRow(row));
}

export function listMyFavoriteAssets(userId: number) {
  const rows = rawDatabase
    .prepare(`
      ${assetSelectSql(userId)}
      INNER JOIN asset_preferences target_pref ON target_pref.asset_id = a.id AND target_pref.user_id = ? 
      WHERE (target_pref.liked = 1 OR target_pref.favorited = 1)
      ORDER BY target_pref.updated_at DESC
    `)
    .all(userId) as AssetRow[];
  return rows.map((row) => mapAssetRow(row));
}

export function listMyDownloadedAssets(userId: number) {
  const rows = rawDatabase
    .prepare(`
      ${assetSelectSql(userId)}
      INNER JOIN (
        SELECT asset_id, MAX(created_at) AS last_downloaded_at
        FROM asset_downloads
        WHERE user_id = ?
        GROUP BY asset_id
      ) dl2 ON dl2.asset_id = a.id
      ORDER BY dl2.last_downloaded_at DESC
    `)
    .all(userId) as AssetRow[];
  return rows.map((row) => mapAssetRow(row));
}

export function getMyAssetDashboard(userId: number) {
  const row = rawDatabase
    .prepare(`
      SELECT
        COUNT(a.id) AS totalAssets,
        COALESCE(SUM(s.download_count), 0) AS totalDownloads,
        COALESCE(SUM(s.like_count), 0) AS totalLikes,
        COALESCE(SUM(s.favorite_count), 0) AS totalFavorites
      FROM assets a
      INNER JOIN asset_stats s ON s.asset_id = a.id
      WHERE a.owner_user_id = ?
    `)
    .get(userId) as {
      totalAssets: number;
      totalDownloads: number;
      totalLikes: number;
      totalFavorites: number;
    };

  return row;
}

export function listProjectApprovalAssets(managerUserId: number) {
  const managedProjectIds = rawDatabase
    .prepare("SELECT project_id FROM project_memberships WHERE user_id = ? AND role = 'manager'")
    .all(managerUserId) as Array<{ project_id: number }>;

  if (managedProjectIds.length === 0) {
    return [];
  }

  const ids = managedProjectIds.map((item) => item.project_id);
  const placeholders = ids.map(() => "?").join(", ");
  const rows = rawDatabase
    .prepare(`
      ${assetSelectSql(managerUserId)}
      WHERE a.status = 'pending' AND a.project_id IN (${placeholders})
      ORDER BY a.created_at DESC, a.id DESC
    `)
    .all(...ids) as AssetRow[];

  return rows.map((row) => ({ ...mapAssetRow(row), projectRole: "manager" as const }));
}

export async function approveAsset(assetId: number, managerUserId: number) {
  const now = nowIso();
  rawDatabase
    .prepare("UPDATE assets SET status = 'approved', approved_at = ?, approved_by = ?, rejected_reason = NULL WHERE id = ?")
    .run(now, managerUserId, assetId);

  const asset = rawDatabase
    .prepare("SELECT owner_user_id AS ownerUserId, title FROM assets WHERE id = ? LIMIT 1")
    .get(assetId) as { ownerUserId: number; title: string } | undefined;
  if (asset) {
    createNotification({
      userId: asset.ownerUserId,
      type: "asset-approved",
      targetType: "asset",
      targetId: assetId,
      message: `${asset.title} 자산이 승인되었습니다.`,
    });
  }
}

export async function rejectAsset(assetId: number, managerUserId: number, reason: string) {
  rawDatabase
    .prepare("UPDATE assets SET status = 'rejected', approved_by = ?, rejected_reason = ?, updated_at = ? WHERE id = ?")
    .run(managerUserId, reason.trim(), nowIso(), assetId);

  const asset = rawDatabase
    .prepare("SELECT owner_user_id AS ownerUserId, title FROM assets WHERE id = ? LIMIT 1")
    .get(assetId) as { ownerUserId: number; title: string } | undefined;
  if (asset) {
    createNotification({
      userId: asset.ownerUserId,
      type: "asset-rejected",
      targetType: "asset",
      targetId: assetId,
      message: `${asset.title} 자산이 거절되었습니다.`,
    });
  }
}

export function listBoardPosts(type: "notice" | "qna") {
  return rawDatabase
    .prepare(`
      SELECT
        p.id,
        p.type,
        p.title,
        SUBSTR(p.content, 1, 120) AS contentPreview,
        p.author_user_id AS authorUserId,
        u.name AS authorName,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt,
        (SELECT COUNT(*) FROM board_comments c WHERE c.post_id = p.id) AS commentCount
      FROM board_posts p
      INNER JOIN users u ON u.id = p.author_user_id
      WHERE p.type = ?
      ORDER BY p.created_at DESC, p.id DESC
    `)
    .all(type);
}

export async function getBoardPostById(postId: number) {
  return rawDatabase
    .prepare(`
      SELECT
        p.id,
        p.type,
        p.title,
        p.content,
        p.author_user_id AS authorUserId,
        u.name AS authorName,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM board_posts p
      INNER JOIN users u ON u.id = p.author_user_id
      WHERE p.id = ?
      LIMIT 1
    `)
    .get(postId);
}

export async function createBoardPost(authorUserId: number, input: { type: "notice" | "qna"; title: string; content: string }) {
  const now = nowIso();
  const result = rawDatabase
    .prepare("INSERT INTO board_posts (type, author_user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(input.type, authorUserId, input.title.trim(), input.content.trim(), now, now);
  return getBoardPostById(Number(result.lastInsertRowid));
}

export function listBoardComments(postId: number) {
  return rawDatabase
    .prepare(`
      SELECT c.id, c.post_id AS postId, c.user_id AS userId, u.name AS userName, c.content, c.created_at AS createdAt, c.updated_at AS updatedAt
      FROM board_comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC, c.id ASC
    `)
    .all(postId);
}

export async function createBoardComment(postId: number, userId: number, content: string) {
  const now = nowIso();
  const result = rawDatabase
    .prepare("INSERT INTO board_comments (post_id, user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
    .run(postId, userId, content.trim(), now, now);

  const post = rawDatabase
    .prepare("SELECT author_user_id AS authorUserId, title FROM board_posts WHERE id = ? LIMIT 1")
    .get(postId) as { authorUserId: number; title: string } | undefined;
  if (post && post.authorUserId !== userId) {
    createNotification({
      userId: post.authorUserId,
      type: "qna-comment",
      targetType: "board",
      targetId: postId,
      message: `${post.title} Q&A에 새 댓글이 등록되었습니다.`,
    });
  }

  return rawDatabase
    .prepare(`
      SELECT c.id, c.post_id AS postId, c.user_id AS userId, u.name AS userName, c.content, c.created_at AS createdAt, c.updated_at AS updatedAt
      FROM board_comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.id = ?
      LIMIT 1
    `)
    .get(Number(result.lastInsertRowid));
}

export function listNotifications(userId: number) {
  return rawDatabase
    .prepare(`
      SELECT id, type, target_type AS targetType, target_id AS targetId, message, created_at AS createdAt, read_at AS readAt
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
    `)
    .all(userId);
}

export async function markNotificationRead(notificationId: number, userId: number) {
  rawDatabase
    .prepare("UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ?")
    .run(nowIso(), notificationId, userId);
}

export function createNotification(input: {
  userId: number;
  type: "asset-approved" | "asset-rejected" | "asset-comment" | "qna-comment";
  targetType: "asset" | "board";
  targetId: number;
  message: string;
}) {
  rawDatabase
    .prepare("INSERT INTO notifications (user_id, type, target_type, target_id, message, read_at, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)")
    .run(input.userId, input.type, input.targetType, input.targetId, input.message, nowIso());
}

export function getHomeDashboard(user: Pick<SessionUser, "globalRole">) {
  const canSeePendingAssets = user.globalRole === "admin";
  const assetRows = rawDatabase
    .prepare(`
      SELECT
        a.kind AS kind,
        SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) AS totalAssets,
        SUM(CASE WHEN a.status = 'approved' AND date(a.created_at, '+9 hours') = date('now', '+9 hours') THEN 1 ELSE 0 END) AS todayAssets,
        SUM(CASE WHEN a.status = 'approved' AND date(a.created_at, '+9 hours') = date('now', '+9 hours', '-1 day') THEN 1 ELSE 0 END) AS yesterdayAssets,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pendingAssets
      FROM assets a
      GROUP BY a.kind
    `)
    .all() as HomeDashboardAssetAggregateRow[];
  const commentRows = rawDatabase
    .prepare(`
      SELECT
        a.kind AS kind,
        SUM(CASE WHEN a.status = 'approved' AND date(c.created_at, '+9 hours') = date('now', '+9 hours') THEN 1 ELSE 0 END) AS todayComments,
        SUM(CASE WHEN a.status = 'approved' AND date(c.created_at, '+9 hours') = date('now', '+9 hours', '-1 day') THEN 1 ELSE 0 END) AS yesterdayComments
      FROM assets a
      LEFT JOIN asset_comments c ON c.asset_id = a.id
      GROUP BY a.kind
    `)
    .all() as HomeDashboardCommentAggregateRow[];

  return {
    canSeePendingAssets,
    sections: Object.fromEntries(
      homeDashboardKinds.map((kind) => {
        const assetRow = assetRows.find((item) => item.kind === kind);
        const commentRow = commentRows.find((item) => item.kind === kind);

        return [
          kind,
          {
            totalAssets: Number(assetRow?.totalAssets ?? 0),
            postDeltaFromYesterday:
              Number(assetRow?.todayAssets ?? 0) - Number(assetRow?.yesterdayAssets ?? 0),
            commentDeltaFromYesterday:
              Number(commentRow?.todayComments ?? 0) - Number(commentRow?.yesterdayComments ?? 0),
            pendingAssets: canSeePendingAssets ? Number(assetRow?.pendingAssets ?? 0) : undefined,
          },
        ];
      }),
    ),
  };
}

export function getAdminDashboard() {
  const totalUsers = Number(
    (rawDatabase.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number }).count,
  );
  const totalAssets = Number(
    (rawDatabase.prepare("SELECT COUNT(*) AS count FROM assets").get() as { count: number }).count,
  );
  const assetsByKindRows = rawDatabase
    .prepare("SELECT kind, COUNT(*) AS count FROM assets GROUP BY kind")
    .all() as Array<{ kind: string; count: number }>;
  const assetsByStatusRows = rawDatabase
    .prepare("SELECT status, COUNT(*) AS count FROM assets GROUP BY status")
    .all() as Array<{ status: string; count: number }>;
  const assetsByProject = rawDatabase
    .prepare(`
      SELECT p.id AS projectId, p.name AS projectName, COUNT(a.id) AS count
      FROM projects p
      LEFT JOIN assets a ON a.project_id = p.id
      GROUP BY p.id, p.name
      ORDER BY count DESC, p.id DESC
    `)
    .all() as ProjectCountRow[];
  const assetsByCategory = rawDatabase
    .prepare(`
      SELECT c.id AS categoryId, c.name AS categoryName, COUNT(a.id) AS count
      FROM asset_categories c
      LEFT JOIN assets a ON a.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC, c.id DESC
    `)
    .all();

  return {
    totalUsers,
    totalAssets,
    assetsByKind: {
      code: assetsByKindRows.find((item) => item.kind === "code")?.count ?? 0,
      knowledge: assetsByKindRows.find((item) => item.kind === "knowledge")?.count ?? 0,
      troubleshooting: assetsByKindRows.find((item) => item.kind === "troubleshooting")?.count ?? 0,
      lesson: assetsByKindRows.find((item) => item.kind === "lesson")?.count ?? 0,
    },
    assetsByStatus: {
      pending: assetsByStatusRows.find((item) => item.status === "pending")?.count ?? 0,
      approved: assetsByStatusRows.find((item) => item.status === "approved")?.count ?? 0,
      rejected: assetsByStatusRows.find((item) => item.status === "rejected")?.count ?? 0,
    },
    assetsByProject,
    assetsByCategory,
  };
}

export function listUsersForAdmin() {
  const rows = rawDatabase
    .prepare(`
      SELECT id, email, name, account_status AS accountStatus, global_role AS globalRole, created_at AS createdAt
      FROM users
      ORDER BY created_at DESC, id DESC
    `)
    .all() as Array<{
      id: number;
      email: string;
      name: string;
      accountStatus: "pending" | "approved" | "rejected";
      globalRole: "user" | "admin";
      createdAt: string;
    }>;

  return rows.map((user) => ({
    ...user,
    managedProjects: rawDatabase
      .prepare(`
        SELECT p.name
        FROM project_memberships pm
        INNER JOIN projects p ON p.id = pm.project_id
        WHERE pm.user_id = ? AND pm.role = 'manager'
      `)
      .all(user.id)
      .map((item: { name: string }) => item.name),
    projectMemberships: rawDatabase
      .prepare(`
        SELECT pm.project_id AS projectId, p.name AS projectName, pm.role AS role
        FROM project_memberships pm
        INNER JOIN projects p ON p.id = pm.project_id
        WHERE pm.user_id = ?
        ORDER BY p.name ASC, pm.id ASC
      `)
      .all(user.id),
  }));
}

export async function approveUser(userId: number) {
  rawDatabase.prepare("UPDATE users SET account_status = 'approved', updated_at = ? WHERE id = ?").run(nowIso(), userId);
}

export async function rejectUser(userId: number, reason: string) {
  rawDatabase.prepare("UPDATE users SET account_status = 'rejected', updated_at = ? WHERE id = ?").run(nowIso(), userId);
}

export async function createProject(createdBy: number, input: { name: string; slug: string; customerName: string; summary: string }) {
  const now = nowIso();
  const result = rawDatabase
    .prepare("INSERT INTO projects (name, slug, customer_name, summary, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(input.name.trim(), input.slug.trim(), input.customerName.trim(), input.summary.trim(), createdBy, now, now);
  const projectId = Number(result.lastInsertRowid);
  rawDatabase
    .prepare("INSERT INTO project_memberships (project_id, user_id, role, created_at) VALUES (?, ?, 'manager', ?)")
    .run(projectId, createdBy, now);
  return listProjects().find((item) => item.id === projectId) ?? null;
}

export async function updateProjectById(projectId: number, input: { name: string; slug: string; customerName: string; summary: string }) {
  rawDatabase
    .prepare("UPDATE projects SET name = ?, slug = ?, customer_name = ?, summary = ?, updated_at = ? WHERE id = ?")
    .run(input.name.trim(), input.slug.trim(), input.customerName.trim(), input.summary.trim(), nowIso(), projectId);
  return listProjects().find((item) => item.id === projectId) ?? null;
}

export function getProjectDeletePreview(projectId: number) {
  const project = rawDatabase
    .prepare("SELECT id, name FROM projects WHERE id = ? LIMIT 1")
    .get(projectId) as { id: number; name: string } | undefined;

  if (!project) {
    return null;
  }

  const totalAssetCount = Number(
    (
      rawDatabase
        .prepare("SELECT COUNT(*) AS count FROM assets WHERE project_id = ?")
        .get(projectId) as { count: number }
    ).count,
  );
  const assetsByKind = rawDatabase
    .prepare(`
      SELECT kind, COUNT(*) AS count
      FROM assets
      WHERE project_id = ?
      GROUP BY kind
      ORDER BY count DESC, kind ASC
    `)
    .all(projectId) as Array<{ kind: string; count: number }>;
  const assetsByCategory = rawDatabase
    .prepare(`
      SELECT c.id AS categoryId, c.name AS categoryName, COUNT(a.id) AS count
      FROM assets a
      INNER JOIN asset_categories c ON c.id = a.category_id
      WHERE a.project_id = ?
      GROUP BY c.id, c.name
      ORDER BY count DESC, c.name ASC
    `)
    .all(projectId);

  return {
    projectId: project.id,
    projectName: project.name,
    totalAssetCount,
    assetsByKind,
    assetsByCategory,
  };
}

export async function deleteProjectById(projectId: number) {
  const preview = getProjectDeletePreview(projectId);
  if (!preview) {
    return "not_found" as const;
  }

  const assetIds = rawDatabase
    .prepare("SELECT id FROM assets WHERE project_id = ?")
    .all(projectId) as Array<{ id: number }>;

  rawDatabase.transaction(() => {
    if (assetIds.length > 0) {
      const placeholders = assetIds.map(() => "?").join(", ");
      const ids = assetIds.map((item) => item.id);

      rawDatabase.prepare(`DELETE FROM notifications WHERE target_type = 'asset' AND target_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM asset_comments WHERE asset_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM asset_downloads WHERE asset_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM asset_preferences WHERE asset_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM asset_stats WHERE asset_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM assets WHERE id IN (${placeholders})`).run(...ids);
    }

    rawDatabase.prepare("DELETE FROM project_memberships WHERE project_id = ?").run(projectId);
    rawDatabase.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
  })();

  return "deleted" as const;
}

export async function createCategory(input: { kind: string; name: string; slug: string; sortOrder: number }) {
  rawDatabase
    .prepare("INSERT INTO asset_categories (kind, name, slug, sort_order) VALUES (?, ?, ?, ?)")
    .run(input.kind, input.name.trim(), input.slug.trim(), input.sortOrder);
  return listAssetCategories(input.kind).find((item) => item.slug === input.slug) ?? null;
}

export async function updateCategoryById(categoryId: number, input: { kind: string; name: string; slug: string; sortOrder: number }) {
  rawDatabase
    .prepare("UPDATE asset_categories SET kind = ?, name = ?, slug = ?, sort_order = ? WHERE id = ?")
    .run(input.kind, input.name.trim(), input.slug.trim(), input.sortOrder, categoryId);
  return rawDatabase
    .prepare("SELECT id, kind, name, slug, sort_order AS sortOrder FROM asset_categories WHERE id = ? LIMIT 1")
    .get(categoryId);
}

export function getCategoryDeletePreview(categoryId: number) {
  const category = rawDatabase
    .prepare("SELECT id, name FROM asset_categories WHERE id = ? LIMIT 1")
    .get(categoryId) as { id: number; name: string } | undefined;

  if (!category) {
    return null;
  }

  const totalAssetCount = Number(
    (
      rawDatabase
        .prepare("SELECT COUNT(*) AS count FROM assets WHERE category_id = ?")
        .get(categoryId) as { count: number }
    ).count,
  );
  const assetsByKind = rawDatabase
    .prepare(`
      SELECT kind, COUNT(*) AS count
      FROM assets
      WHERE category_id = ?
      GROUP BY kind
      ORDER BY count DESC, kind ASC
    `)
    .all(categoryId) as Array<{ kind: string; count: number }>;

  return {
    categoryId: category.id,
    categoryName: category.name,
    totalAssetCount,
    assetsByKind,
    assetsByCategory: [
      {
        categoryId: category.id,
        categoryName: category.name,
        count: totalAssetCount,
      },
    ],
  };
}

export async function deleteCategoryById(categoryId: number) {
  const preview = getCategoryDeletePreview(categoryId);
  if (!preview) {
    return "not_found" as const;
  }

  const assetIds = rawDatabase
    .prepare("SELECT id FROM assets WHERE category_id = ?")
    .all(categoryId) as Array<{ id: number }>;

  rawDatabase.transaction(() => {
    if (assetIds.length > 0) {
      const placeholders = assetIds.map(() => "?").join(", ");
      const ids = assetIds.map((item) => item.id);

      rawDatabase.prepare(`DELETE FROM notifications WHERE target_type = 'asset' AND target_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM asset_comments WHERE asset_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM asset_downloads WHERE asset_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM asset_preferences WHERE asset_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM asset_stats WHERE asset_id IN (${placeholders})`).run(...ids);
      rawDatabase.prepare(`DELETE FROM assets WHERE id IN (${placeholders})`).run(...ids);
    }

    rawDatabase.prepare("DELETE FROM asset_categories WHERE id = ?").run(categoryId);
  })();

  return "deleted" as const;
}

export async function upsertProjectMembership(input: {
  userId: number;
  projectId: number;
  role: "user" | "manager";
}) {
  rawDatabase
    .prepare(`
      INSERT INTO project_memberships (project_id, user_id, role, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(project_id, user_id) DO UPDATE SET role = excluded.role
    `)
    .run(input.projectId, input.userId, input.role, nowIso());
}

export async function deleteProjectMembership(input: { userId: number; projectId: number }) {
  rawDatabase
    .prepare("DELETE FROM project_memberships WHERE user_id = ? AND project_id = ?")
    .run(input.userId, input.projectId);
}
