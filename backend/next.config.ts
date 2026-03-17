/**
 * 목적: 백엔드 Next.js 런타임 기본 설정을 정의한다.
 * 설명: App Router 기반 API 서버가 Cloud Run 단일 서비스와 모노레포 파일 트레이싱에 맞게 빌드되도록 설정한다.
 * 적용 패턴: 구성 객체 패턴
 * 참조: backend/src/app, backend/src/db
 */
import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
};

export default nextConfig;
