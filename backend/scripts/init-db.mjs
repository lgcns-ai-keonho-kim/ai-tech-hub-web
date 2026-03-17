/**
 * 목적: TypeScript 기반 SQLite 초기화 엔트리를 Node만으로 실행한다.
 * 설명: esbuild로 init-db.ts를 임시 번들한 뒤 실행해 Docker와 로컬 환경이 tsx 없이 같은 초기화 경로를 사용하게 한다.
 * 적용 패턴: 런처 스크립트 패턴
 * 참조: backend/src/db/scripts/init-db.ts, backend/package.json
 */
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const tempDirPath = path.resolve(backendRoot, ".tmp");
const bundlePath = path.resolve(tempDirPath, "init-db.bundle.mjs");

mkdirSync(tempDirPath, { recursive: true });

try {
  await build({
    absWorkingDir: backendRoot,
    bundle: true,
    entryPoints: [path.resolve(backendRoot, "src/db/scripts/init-db.ts")],
    external: ["better-sqlite3"],
    format: "esm",
    outfile: bundlePath,
    platform: "node",
    target: "node24",
    tsconfig: path.resolve(backendRoot, "tsconfig.json"),
  });

  await import(`${pathToFileURL(bundlePath).href}?ts=${Date.now()}`);
} finally {
  rmSync(bundlePath, { force: true });
}
