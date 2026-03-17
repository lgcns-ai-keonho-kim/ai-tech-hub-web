/**
 * 목적: 개발 환경용 SQLite 파일을 명시적으로 초기화한다.
 * 설명: 루트 `npm run dev` 실행 전 데이터 파일과 기본 시드 적재를 보장한다.
 * 적용 패턴: 초기화 스크립트 패턴
 * 참조: backend/src/db/index.ts, backend/src/db/bootstrap.ts
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import Database from "better-sqlite3";

import { bootstrapDatabase } from "@/db/bootstrap";

const databaseFilePath = resolve(process.cwd(), "..", "data", "mock.db");
mkdirSync(dirname(databaseFilePath), { recursive: true });

const rawDatabase = new Database(databaseFilePath, {});

bootstrapDatabase(rawDatabase, databaseFilePath);
rawDatabase.close();

console.log(`mock.db 준비 완료: ${databaseFilePath}`);
