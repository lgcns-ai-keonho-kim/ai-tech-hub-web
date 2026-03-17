/**
 * 목적: 공지사항/Q&A 목록 조회와 등록 API를 제공한다.
 * 설명: 게시판 종류별 조회와 권한 기반 등록을 한 엔드포인트에서 처리한다.
 * 적용 패턴: 컬렉션 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { createBoardPost, listBoardPosts } from "@/db/repositories";
import { boardTypeSchema, createBoardPostBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(request: Request) {
  return withErrorBoundary(async () => {
    await requireSessionUser(request);
    const type = boardTypeSchema.parse(new URL(request.url).searchParams.get("type"));
    return { posts: listBoardPosts(type) };
  });
}

export async function POST(request: Request) {
  return withErrorBoundary(async () => {
    const currentUser = await requireSessionUser(request);
    const body = await parseJsonBody(request, createBoardPostBodySchema);

    if (body.type === "notice" && currentUser.globalRole !== "admin") {
      throw new ApiError({
        status: 403,
        code: "notice_admin_required",
        message: "공지사항은 관리자만 등록할 수 있습니다.",
      });
    }

    const post = await createBoardPost(currentUser.id, body);
    return { post };
  });
}
