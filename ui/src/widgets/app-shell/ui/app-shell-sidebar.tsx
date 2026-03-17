/**
 * 목적: 보호 영역 공통 사이드바를 렌더링한다.
 * 설명: 회사 로고, 주요 메뉴, 알림 진입, 사용자 드롭다운을 좌측 수직 셸로 통합하고 인증성 캐시와 함께 동작한다.
 * 적용 패턴: 앱 셸 사이드바 패턴
 * 참조: ui/src/app/root-layout.tsx, ui/src/app/router.tsx
 */
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { notificationQueryKeys } from "@/entities/notification/model/queries";
import { projectQueryKeys } from "@/entities/project/model/queries";
import { useAuthStore } from "@/entities/session/model/store";
import type { SidebarPanelKind } from "@/widgets/app-shell/config/navigation";
import { useSidebarAttention } from "@/widgets/app-shell/model/use-sidebar-attention";
import { SidebarFrame } from "@/widgets/app-shell/ui/sidebar-frame";

type AppShellSidebarProps = {
  isDesktopViewport: boolean;
  isSidebarExpanded: boolean;
  onDesktopSidebarExpandedChange: (expanded: boolean) => void;
};

function isWithinSidebarPanelRegion({
  target,
  sidebarElement,
  panelContentElement,
}: {
  target: EventTarget | null;
  sidebarElement: HTMLElement | null;
  panelContentElement: HTMLElement | null;
}) {
  const node = target instanceof Node ? target : null;

  if (!node) {
    return false;
  }

  return Boolean(
    sidebarElement?.contains(node) || panelContentElement?.contains(node),
  );
}

export function AppShellSidebar({
  isDesktopViewport,
  isSidebarExpanded,
  onDesktopSidebarExpandedChange,
}: AppShellSidebarProps) {
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);
  const {
    hasApprovalsError,
    hasNotificationError,
    isAttentionReady,
    pendingApprovalCount,
    pendingApprovalsPreview,
    totalAttentionCount,
    unreadNotificationCount,
    unreadNotificationsPreview,
  } = useSidebarAttention();
  const [activePanel, setActivePanel] = useState<SidebarPanelKind | null>(null);
  const activePanelRef = useRef<SidebarPanelKind | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const noticePanelContentRef = useRef<HTMLDivElement | null>(null);
  const userPanelContentRef = useRef<HTMLDivElement | null>(null);
  const isSidebarHoveredRef = useRef(false);
  const isExpandedSidebar = isDesktopViewport && isSidebarExpanded;

  const syncDesktopSidebarExpanded = (nextActivePanel: SidebarPanelKind | null) => {
    if (!isDesktopViewport) {
      return;
    }

    onDesktopSidebarExpandedChange(
      isSidebarHoveredRef.current || nextActivePanel !== null,
    );
  };

  const getPanelContentElement = (panel: SidebarPanelKind | null) => {
    if (panel === "notice") {
      return noticePanelContentRef.current;
    }

    if (panel === "user") {
      return userPanelContentRef.current;
    }

    return null;
  };

  const applyActivePanel = (nextActivePanel: SidebarPanelKind | null) => {
    activePanelRef.current = nextActivePanel;
    setActivePanel(nextActivePanel);
    syncDesktopSidebarExpanded(nextActivePanel);
  };

  const closeActivePanel = () => {
    applyActivePanel(null);
  };

  const handlePanelRegionPointerLeave = (
    panel: SidebarPanelKind,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (!isDesktopViewport || activePanelRef.current !== panel) {
      return;
    }

    if (
      isWithinSidebarPanelRegion({
        target: event.relatedTarget,
        sidebarElement: sidebarRef.current,
        panelContentElement: getPanelContentElement(panel),
      })
    ) {
      return;
    }

    closeActivePanel();
  };

  const handlePanelOpenChange = (
    panel: SidebarPanelKind,
    open: boolean,
  ) => {
    const currentPanel = activePanelRef.current;
    const nextActivePanel = open
      ? panel
      : currentPanel === panel
        ? null
        : currentPanel;

    applyActivePanel(nextActivePanel);
  };

  const handleNavigate = () => {
    closeActivePanel();
  };

  const handleSignOut = () => {
    closeActivePanel();
    queryClient.removeQueries({ queryKey: notificationQueryKeys.all });
    queryClient.removeQueries({ queryKey: projectQueryKeys.approvalsRoot });
    clearSession();
  };

  return (
    <aside
      ref={sidebarRef}
      className="app-sidebar"
      onPointerEnter={() => {
        isSidebarHoveredRef.current = true;
        syncDesktopSidebarExpanded(activePanelRef.current);
      }}
      onPointerLeave={(event) => {
        isSidebarHoveredRef.current = false;
        if (!isDesktopViewport) {
          return;
        }

        if (
          isWithinSidebarPanelRegion({
            target: event.relatedTarget,
            sidebarElement: sidebarRef.current,
            panelContentElement: getPanelContentElement(activePanelRef.current),
          })
        ) {
          return;
        }

        if (activePanelRef.current !== null) {
          closeActivePanel();
          return;
        }

        syncDesktopSidebarExpanded(null);
      }}
    >
      <SidebarFrame
        expanded={isExpandedSidebar}
        hasApprovalsError={hasApprovalsError}
        hasNotificationError={hasNotificationError}
        isAttentionReady={isAttentionReady}
        totalAttentionCount={totalAttentionCount}
        unreadCount={unreadNotificationCount}
        unreadNotifications={unreadNotificationsPreview}
        pendingApprovalCount={pendingApprovalCount}
        pendingApprovals={pendingApprovalsPreview}
        session={session}
        activePanel={activePanel}
        noticePanelContentRef={noticePanelContentRef}
        userPanelContentRef={userPanelContentRef}
        onPanelOpenChange={handlePanelOpenChange}
        onPanelRegionPointerLeave={handlePanelRegionPointerLeave}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
      />
    </aside>
  );
}
