/**
 * 목적: 관리자 프로젝트 생성/조회 API를 제공한다.
 * 설명: 프로젝트 관리 화면이 같은 엔드포인트로 목록과 생성을 처리하게 한다.
 * 적용 패턴: 관리자 컬렉션 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { createProject, listProjects } from "@/db/repositories";
import { createProjectBodySchema } from "@/lib/contracts";
import { parseJsonBody, requireAdminUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    await requireAdminUser(request);
    return { projects: listProjects() };
  });
}

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const admin = await requireAdminUser(request);
    const body = await parseJsonBody(request, createProjectBodySchema);
    const project = await createProject(admin.id, body);
    return { project };
  });
}
