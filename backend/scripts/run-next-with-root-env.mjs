/**
 * 목적: backend 워크스페이스가 프로젝트 루트 .env를 읽고 Next.js를 실행하게 한다.
 * 설명: 루트 .env가 있으면 BACKEND_PORT를 읽고, 없으면 기본 포트로 dev/start 실행을 계속 진행한다.
 * 적용 패턴: 런처 스크립트 패턴
 * 참조: backend/package.json, ../../.env.sample
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(backendRoot, "..");
const rootEnvPath = path.resolve(repoRoot, ".env");

if (existsSync(rootEnvPath)) {
  process.loadEnvFile(rootEnvPath);
}

const mode = process.argv[2];
if (mode !== "dev" && mode !== "start") {
  throw new Error("run-next-with-root-env.mjs는 dev 또는 start 모드만 지원합니다.");
}

function parsePort(rawValue, fallbackPort) {
  const parsedPort = Number(rawValue);
  return Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : fallbackPort;
}

const port = parsePort(process.env.BACKEND_PORT, 3000);
const nextBinPath = require.resolve("next/dist/bin/next");
const childProcess = spawn(
  process.execPath,
  [nextBinPath, mode, "--port", String(port)],
  {
    cwd: backendRoot,
    env: process.env,
    stdio: "inherit",
  },
);

childProcess.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
