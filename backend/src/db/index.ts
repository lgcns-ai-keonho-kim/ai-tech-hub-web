/**
 * 목적: Drizzle 데이터베이스 인스턴스를 생성하고 재사용한다.
 * 설명: 초기화가 끝난 SQLite 파일에 연결하고, Next.js 개발 모드의 모듈 재로딩에서도 연결을 안정적으로 유지한다.
 * 적용 패턴: 싱글턴 패턴
 * 참조: backend/src/db/schema.ts, backend/src/db/initialize.ts
 */
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { resolveDatabaseFilePath } from "@/db/paths";
import * as schema from "@/db/schema";

export const databaseFilePath = resolveDatabaseFilePath();
mkdirSync(dirname(databaseFilePath), { recursive: true });

const sqlite =
  globalThis.__agentHubSqlite__ ?? new Database(databaseFilePath, {});

const drizzleDatabase = drizzle(sqlite, { schema });
type DrizzleDatabase = typeof drizzleDatabase;

declare global {
  // eslint-disable-next-line no-var
  var __agentHubSqlite__: Database.Database | undefined;
  // eslint-disable-next-line no-var
  var __agentHubDrizzle__: DrizzleDatabase | undefined;
}

export const rawDatabase = sqlite;
export const db =
  globalThis.__agentHubDrizzle__ ?? drizzleDatabase;

if (process.env.NODE_ENV !== "production") {
  globalThis.__agentHubSqlite__ = sqlite;
  globalThis.__agentHubDrizzle__ = db;
}

export type AppDatabase = typeof db;
