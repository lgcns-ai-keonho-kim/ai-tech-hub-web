/**
 * 목적: Q&A 댓글 조회와 등록 API를 제공한다.
 * 설명: 공지사항은 읽기 전용이고, Q&A만 댓글을 허용한다.
 * 적용 패턴: 하위 컬렉션 엔드포인트 패턴
 * 참조: backend/src/lib/contracts.ts, backend/src/db/repositories.ts
 */
import { createBoardComment, getBoardPostById, listBoardComments } from "@/db/repositories";
import { createCommentBodySchema } from "@/lib/contracts";
import { ApiError, parseJsonBody, requireSessionUser, withErrorBoundary } from "@/lib/http";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    await requireSessionUser(request);
    const params = await context.params;
    return { comments: listBoardComments(Number(params.id)) };
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return withErrorBoundary(async () => {
    const session = await requireSessionUser(request);
    const params = await context.params;
    const postId = Number(params.id);
    const post = await getBoardPostById(postId);

    if (!post) {
      throw new ApiError({
        status: 404,
        code: "board_post_not_found",
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    if (post.type !== "qna") {
      throw new ApiError({
        status: 409,
        code: "board_comment_not_allowed",
        message: "공지사항에는 댓글을 등록할 수 없습니다.",
      });
    }

    const body = await parseJsonBody(request, createCommentBodySchema);
    const comment = await createBoardComment(postId, session.id, body.content);
    return { comment };
  });
}
