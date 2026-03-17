/**
 * 목적: 내 다운로드 자산 목록 API를 제공한다.
 * 설명: 사용자가 다운로드한 자산의 중복 제거 목록을 반환한다.
 * 적용 패턴: 개인화 조회 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { listMyDownloadedAssets } from "@/db/repositories";
import { requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    const session = await requireSessionUser(request);
    return { assets: listMyDownloadedAssets(session.id) };
  });
}
