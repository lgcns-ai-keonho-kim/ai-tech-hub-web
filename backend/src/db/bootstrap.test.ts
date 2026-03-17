/**
 * 목적: 데이터베이스 부트스트랩이 새 도메인 테이블과 시드를 준비하는지 검증한다.
 * 설명: 인메모리 SQLite 기준으로 핵심 테이블 생성과 초기 데이터 적재를 확인한다.
 * 적용 패턴: 부트스트랩 테스트 패턴
 * 참조: backend/src/db/bootstrap.ts, backend/src/db/seed-data.ts
 */
import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

import { bootstrapDatabase } from "@/db/bootstrap";

describe("bootstrapDatabase", () => {
  it("핵심 테이블을 만들고 기본 시드를 적재한다", () => {
    const database = new Database(":memory:");

    bootstrapDatabase(database, "/tmp/asset-tech-hub-test.db");

    const tableRows = database
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('users', 'projects', 'assets', 'board_posts', 'notifications')",
      )
      .all() as Array<{ name: string }>;
    const userCount = (
      database.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number }
    ).count;
    const projectCount = (
      database.prepare("SELECT COUNT(*) AS count FROM projects").get() as { count: number }
    ).count;
    const assetCount = (
      database.prepare("SELECT COUNT(*) AS count FROM assets").get() as { count: number }
    ).count;

    expect(tableRows.map((row) => row.name).sort()).toEqual([
      "assets",
      "board_posts",
      "notifications",
      "projects",
      "users",
    ]);
    expect(userCount).toBeGreaterThan(0);
    expect(projectCount).toBeGreaterThan(0);
    expect(assetCount).toBeGreaterThan(0);
  });
});
