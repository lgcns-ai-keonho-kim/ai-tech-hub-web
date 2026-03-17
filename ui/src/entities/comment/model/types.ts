/**
 * 목적: 댓글 작성 피처가 공유하는 입력 타입을 제공한다.
 * 설명: 자산 댓글과 게시판 댓글이 동일한 입력 계약을 재사용하게 한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/features/asset-actions/model/mutations.ts, ui/src/features/board-actions/model/mutations.ts
 */
export type CreateCommentInput = {
  content: string;
};
