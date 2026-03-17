/**
 * 목적: 프로젝트 목록 조회 API를 제공한다.
 * 설명: 프로젝트 검색 입력과 목록 화면이 같은 엔드포인트를 재사용할 수 있게 한다.
 * 적용 패턴: 조회 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { listProjects } from "@/db/repositories";
import { listProjectsQuerySchema } from "@/lib/contracts";
import { requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    await requireSessionUser(request);
    const query = listProjectsQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );

    return {
      projects: listProjects(query.query),
    };
  });
}
