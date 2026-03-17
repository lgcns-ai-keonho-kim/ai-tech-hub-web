/**
 * 목적: SQLite 파일 초기화 절차를 재사용 가능한 함수로 제공한다.
 * 설명: 경로 결정, 디렉터리 생성, bootstrap 실행, 연결 종료를 한 번에 처리해 CLI/테스트가 같은 초기화 경로를 사용하게 한다.
 * 적용 패턴: 명시 초기화 패턴
 * 참조: backend/src/db/bootstrap.ts, backend/src/db/scripts/init-db.ts, backend/vitest.config.ts
 */
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";

import { bootstrapDatabase } from "@/db/bootstrap";
import { resolveDatabaseFilePath } from "@/db/paths";

export function initializeSqliteDatabase(databaseFilePath = resolveDatabaseFilePath()) {
  mkdirSync(dirname(databaseFilePath), { recursive: true });

  const rawDatabase = new Database(databaseFilePath, {});
  try {
    bootstrapDatabase(rawDatabase, databaseFilePath);
  } finally {
    rawDatabase.close();
  }

  return databaseFilePath;
}
