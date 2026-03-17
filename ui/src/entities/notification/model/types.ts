/**
 * 목적: 알림 엔티티가 소유하는 타입 계약을 정의한다.
 * 설명: 알림 목록, 읽음 처리, 앱 셸 배지 집계가 같은 알림 모델을 공유하게 한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/entities/notification/model/queries.ts, ui/src/features/notification-actions/model/mutations.ts
 */
export type NotificationType =
  | "asset-approved"
  | "asset-rejected"
  | "asset-comment"
  | "qna-comment";

export type NotificationItem = {
  id: number;
  type: NotificationType;
  targetType: "asset" | "board";
  targetId: number;
  message: string;
  createdAt: string;
  readAt: string | null;
};
