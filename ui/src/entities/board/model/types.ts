/**
 * 목적: 게시판 엔티티가 소유하는 타입 계약을 정의한다.
 * 설명: 공지사항/Q&A 목록, 상세, 작성 흐름이 같은 게시판 모델을 공유하게 한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/entities/board/model/queries.ts, ui/src/features/board-actions/model/mutations.ts
 */
export type BoardType = "notice" | "qna";

export type BoardPostSummary = {
  id: number;
  type: BoardType;
  title: string;
  contentPreview: string;
  authorUserId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
};

export type BoardPostDetail = {
  id: number;
  type: BoardType;
  title: string;
  content: string;
  authorUserId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardComment = {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBoardPostInput = {
  type: BoardType;
  title: string;
  content: string;
};
