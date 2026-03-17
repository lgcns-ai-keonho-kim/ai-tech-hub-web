/**
 * 목적: 보호 라우트 공통 레이아웃을 제공한다.
 * 설명: 좌측 사이드바, 우측 콘텐츠, 테마 토글, 스크롤 초기화를 함께 적용한다.
 * 적용 패턴: 레이아웃 컴포지션 패턴
 * 참조: ui/src/widgets/app-shell-header.tsx, ui/src/shared/ui/ambient-backdrop.tsx
 */
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { AmbientBackdrop } from "@/shared/ui/ambient-backdrop";
import { ThemeToggle } from "@/widgets/theme-toggle";
import { AppShellSidebar } from "@/widgets/app-shell/ui/app-shell-sidebar";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

function isDesktopViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function ScrollReset() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

export function RootLayout() {
  const location = useLocation();
  const [desktopViewport, setDesktopViewport] = useState(() => isDesktopViewport());
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleViewportChange = (event?: MediaQueryListEvent) => {
      const matches = event?.matches ?? mediaQueryList.matches;
      setDesktopViewport(matches);
      if (!matches) {
        setDesktopSidebarExpanded(false);
      }
    };

    handleViewportChange();
    mediaQueryList.addEventListener("change", handleViewportChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    setDesktopSidebarExpanded(false);
  }, [location.pathname]);

  return (
    <div className="ambient-root">
      <ScrollReset />
      <AmbientBackdrop />
      <div
        className="app-shell-layout"
        data-collapsed={desktopViewport ? String(!desktopSidebarExpanded) : "true"}
      >
        <AppShellSidebar
          isDesktopViewport={desktopViewport}
          isSidebarExpanded={desktopSidebarExpanded}
          onDesktopSidebarExpandedChange={setDesktopSidebarExpanded}
        />
        <main className="app-content">
          <div className="app-content-shell">
            <div className="app-content-utility">
              <ThemeToggle className="rounded-md" />
            </div>
            <div key={location.pathname} className="page-transition page-stagger flex flex-1 flex-col">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
