/**
 * 목적: backend 워크스페이스의 Vitest 실행 환경을 설정한다.
 * 설명: Node 환경과 경로 별칭을 맞춰 저장소/계약 테스트가 같은 import 규칙을 사용하게 한다.
 * 적용 패턴: 테스트 구성 패턴
 * 참조: backend/src, backend/package.json
 */
import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
