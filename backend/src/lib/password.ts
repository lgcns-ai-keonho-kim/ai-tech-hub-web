/**
 * 목적: Mock 인증용 비밀번호 해시/검증 함수를 제공한다.
 * 설명: 외부 인증 서비스 없이도 SQLite 사용자 정보를 안전하게 비교할 수 있도록 고정 규칙 해시를 사용한다.
 * 적용 패턴: 보안 유틸리티 패턴
 * 참조: backend/src/db/bootstrap.ts, backend/src/db/repositories.ts
 */
import { timingSafeEqual, scryptSync } from "node:crypto";

const PASSWORD_SALT = "asset-tech-hub-mock-auth";

export function hashPassword(password: string) {
  return scryptSync(password, PASSWORD_SALT, 64).toString("hex");
}

export function verifyPassword(password: string, passwordHash: string) {
  const source = Buffer.from(hashPassword(password), "hex");
  const target = Buffer.from(passwordHash, "hex");

  if (source.length !== target.length) {
    return false;
  }

  return timingSafeEqual(source, target);
}
