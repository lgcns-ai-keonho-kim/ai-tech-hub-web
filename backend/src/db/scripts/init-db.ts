/**
 * 목적: 개발 환경용 SQLite 파일을 명시적으로 초기화한다.
 * 설명: `SQLITE_PATH` 계약에 따라 데이터 파일과 기본 시드 적재를 보장한다.
 * 적용 패턴: 초기화 스크립트 패턴
 * 참조: backend/src/db/initialize.ts, backend/src/db/paths.ts
 */
import { initializeSqliteDatabase } from "@/db/initialize";

const databaseFilePath = initializeSqliteDatabase();
console.log(`SQLite 데이터베이스 준비 완료: ${databaseFilePath}`);
