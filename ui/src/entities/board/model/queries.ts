/**
 * 목적: 게시판 엔티티가 소유하는 조회 훅을 제공한다.
 * 설명: 공지사항/Q&A 목록, 상세, 댓글을 게시판 레이어에서 일관되게 조회한다.
 * 적용 패턴: Query 캡슐화 패턴
 * 참조: ui/src/entities/board/model/types.ts, ui/src/shared/api/http/client.ts
 */
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getRequest } from "@/shared/api/http/client";
import type {
  BoardComment,
  BoardPostDetail,
  BoardPostSummary,
  BoardType,
} from "@/entities/board/model/types";

export const boardQueryKeys = {
  posts: (type: BoardType) => ["board-posts", type] as const,
  post: (postId: number) => ["board-post", postId] as const,
  comments: (postId: number) => ["board-comments", postId] as const,
};

function buildSearchParams(input: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

export function useBoardPostsQuery(type: BoardType) {
  return useQuery({
    queryKey: boardQueryKeys.posts(type),
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const search = buildSearchParams({ type });
      const response = await getRequest<{ posts: BoardPostSummary[] }>(
        `/board/posts?${search}`,
        { signal },
      );
      return response.posts;
    },
  });
}

export function useBoardPostDetailQuery(postId?: number) {
  return useQuery({
    queryKey: boardQueryKeys.post(postId ?? 0),
    enabled: Boolean(postId),
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ post: BoardPostDetail }>(`/board/posts/${postId}`, {
        signal,
      });
      return response.post;
    },
  });
}

export function useBoardCommentsQuery(postId?: number) {
  return useQuery({
    queryKey: boardQueryKeys.comments(postId ?? 0),
    enabled: Boolean(postId),
    queryFn: async ({ signal }) => {
      const response = await getRequest<{ comments: BoardComment[] }>(
        `/board/posts/${postId}/comments`,
        { signal },
      );
      return response.comments;
    },
  });
}
