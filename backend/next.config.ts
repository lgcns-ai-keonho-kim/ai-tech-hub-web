/**
 * 목적: 백엔드 Next.js 런타임 기본 설정을 정의한다.
 * 설명: App Router 기반 API 전용 워크스페이스의 최소 설정만 유지한다.
 * 적용 패턴: 구성 객체 패턴
 * 참조: backend/src/app, backend/src/db
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
};

export default nextConfig;
