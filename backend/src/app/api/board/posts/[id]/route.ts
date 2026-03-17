/**
 * 목적: 게시글 상세 조회 API를 제공한다.
 * 설명: 공지사항/Q&A 상세 본문을 같은 구조로 반환한다.
 * 적용 패턴: 단건 조회 엔드포인트 패턴
 * 참조: backend/src/db/repositories.ts
 */
import { getBoardPostById } from "@/db/repositories";
import { ApiError, requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireSessionUser(request);
    const params = await context.params;
    const post = await getBoardPostById(Number(params.id));

    if (!post) {
      throw new ApiError({
        status: 404,
        code: "board_post_not_found",
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    return { post };
  });
}
