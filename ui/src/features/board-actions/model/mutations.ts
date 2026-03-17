/**
 * 목적: 게시판 관련 변경 훅을 제공한다.
 * 설명: 게시글 작성, 댓글 작성과 캐시 무효화를 게시판 피처에 모은다.
 * 적용 패턴: Mutation 캡슐화 패턴
 * 참조: ui/src/entities/board/model/queries.ts, ui/src/entities/comment/model/types.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { boardQueryKeys } from "@/entities/board/model/queries";
import type {
  BoardComment,
  BoardPostDetail,
  CreateBoardPostInput,
} from "@/entities/board/model/types";
import type { CreateCommentInput } from "@/entities/comment/model/types";
import { notificationQueryKeys } from "@/entities/notification/model/queries";
import { postRequest } from "@/shared/api/http/client";

export function useCreateBoardPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBoardPostInput) =>
      postRequest<{ post: BoardPostDetail }, CreateBoardPostInput>("/board/posts", input),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: boardQueryKeys.posts(response.post.type) });
      toast.success("게시글이 등록되었습니다.");
    },
  });
}

export function useCreateBoardCommentMutation(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      postRequest<{ comment: BoardComment }, CreateCommentInput>(
        `/board/posts/${postId}/comments`,
        input,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardQueryKeys.comments(postId) });
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      toast.success("댓글이 등록되었습니다.");
    },
  });
}
