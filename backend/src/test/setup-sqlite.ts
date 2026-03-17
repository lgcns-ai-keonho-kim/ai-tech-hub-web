/**
 * 목적: 저장소 테스트용 SQLite 파일을 명시적으로 초기화한다.
 * 설명: import 부작용 없이 테스트 시작 전에 고정 경로 DB를 재시드해 저장소/계약 테스트가 같은 상태에서 시작하게 한다.
 * 적용 패턴: 테스트 초기화 패턴
 * 참조: backend/src/db/initialize.ts, backend/vitest.config.ts
 */
import { initializeSqliteDatabase } from "@/db/initialize";

process.env.SQLITE_PATH = "/tmp/asset-tech-hub-vitest/mock.db";
initializeSqliteDatabase();
