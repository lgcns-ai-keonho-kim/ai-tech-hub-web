/**
 * 목적: 앱 셸 사이드바가 사용하는 attention 집계 모델을 제공한다.
 * 설명: 알림과 프로젝트 승인 대기 데이터를 세션 경계와 로딩 상태까지 포함해 한 곳에서 조합한다.
 * 적용 패턴: 위젯 모델 패턴
 * 참조: ui/src/entities/notification/model/queries.ts, ui/src/entities/project/model/queries.ts
 */
import { useMemo } from "react";

import { useNotificationsQuery } from "@/entities/notification/model/queries";
import { useProjectApprovalsQuery } from "@/entities/project/model/queries";
import { useAuthStore } from "@/entities/session/model/store";

export function useSidebarAttention() {
  const approvedUserId = useAuthStore((state) =>
    state.session?.user.accountStatus === "approved" ? state.session.user.id : null,
  );
  const approvalScopeKey = useAuthStore((state) => {
    const session = state.session;
    if (!session || session.user.accountStatus !== "approved" || session.managedProjectIds.length === 0) {
      return "none";
    }

    return session.managedProjectIds.join(",");
  });
  const notificationsQuery = useNotificationsQuery();
  const approvalsQuery = useProjectApprovalsQuery();
  const unreadNotifications = useMemo(
    () => (notificationsQuery.data ?? []).filter((item) => !item.readAt),
    [notificationsQuery.data],
  );
  const pendingApprovals = useMemo(
    () => approvalsQuery.data ?? [],
    [approvalsQuery.data],
  );

  const notificationsExpected = approvedUserId !== null;
  const approvalsExpected = approvedUserId !== null && approvalScopeKey !== "none";
  const notificationsReady = !notificationsExpected || notificationsQuery.status === "success";
  const approvalsReady = !approvalsExpected || approvalsQuery.status === "success";

  return {
    totalAttentionCount: unreadNotifications.length + pendingApprovals.length,
    unreadNotificationCount: unreadNotifications.length,
    unreadNotificationsPreview: unreadNotifications.slice(0, 3),
    pendingApprovalCount: pendingApprovals.length,
    pendingApprovalsPreview: pendingApprovals.slice(0, 3),
    isAttentionReady: notificationsReady && approvalsReady,
    hasNotificationError: notificationsExpected && notificationsQuery.isError,
    hasApprovalsError: approvalsExpected && approvalsQuery.isError,
  };
}
