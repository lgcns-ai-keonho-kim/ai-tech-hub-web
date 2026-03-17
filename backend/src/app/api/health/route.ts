/**
 * 목적: 백엔드 상태 확인용 간단한 헬스 체크 엔드포인트를 제공한다.
 * 설명: 개발 중 API 서버가 살아 있는지 빠르게 확인할 수 있게 한다.
 * 적용 패턴: 헬스 체크 패턴
 * 참조: backend/src/lib/http.ts
 */
import { withErrorBoundary } from "@/lib/http";

export async function GET() {
  return withErrorBoundary(() => ({
    status: "ok",
    service: "backend",
  }));
}
