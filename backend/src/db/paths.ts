/**
 * 목적: 백엔드가 사용하는 SQLite 파일 경로 결정을 한 곳에서 관리한다.
 * 설명: Cloud Run과 로컬 개발 환경이 같은 환경 변수 계약(`SQLITE_PATH`)을 공유하도록 기본 경로를 정한다.
 * 적용 패턴: 구성 캡슐화 패턴
 * 참조: backend/src/db/index.ts, backend/src/db/scripts/init-db.ts
 */
import { resolve } from "node:path";

export const defaultSqlitePath = "/tmp/asset-tech-hub/mock.db";

export function resolveDatabaseFilePath() {
  const rawPath = process.env.SQLITE_PATH?.trim();

  if (!rawPath) {
    return defaultSqlitePath;
  }

  return rawPath.startsWith("/") ? rawPath : resolve(process.cwd(), "..", rawPath);
}
