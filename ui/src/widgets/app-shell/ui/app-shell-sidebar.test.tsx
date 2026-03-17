/**
 * 목적: 보호 영역 사이드바의 알림/유저 패널 확장·전환·자동 닫힘 상호작용을 검증한다.
 * 설명: 알림 badge, 알림·유저 패널 확장, 자동 닫힘 상호작용이 기대한 계약을 만족하는지 확인한다.
 * 적용 패턴: 위젯 상호작용 테스트 패턴
 * 참조: ui/src/widgets/app-shell/ui/app-shell-sidebar.tsx, ui/src/widgets/app-shell/ui/sidebar-frame.tsx
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as notificationQueries from "@/entities/notification/model/queries";
import * as projectQueries from "@/entities/project/model/queries";
import type { UserSession } from "@/entities/session/model/types";
import * as authStore from "@/entities/session/model/store";
import { asQueryResult } from "@/test/react-query-mocks";
import { AppShellSidebar } from "@/widgets/app-shell/ui/app-shell-sidebar";

vi.mock("@/entities/notification/model/queries", () => ({
  useNotificationsQuery: vi.fn(),
}));

vi.mock("@/entities/project/model/queries", () => ({
  useProjectApprovalsQuery: vi.fn(),
}));

vi.mock("@/entities/session/model/store", () => ({
  useAuthStore: vi.fn(),
}));

const mockedUseNotificationsQuery = vi.mocked(notificationQueries.useNotificationsQuery);
const mockedUseProjectApprovalsQuery = vi.mocked(projectQueries.useProjectApprovalsQuery);
const mockedUseAuthStore = vi.mocked(authStore.useAuthStore);

const session: UserSession = {
  user: {
    id: 7,
    email: "skyler@example.com",
    name: "김하늘",
    accountStatus: "approved",
    globalRole: "admin",
  },
  managedProjectIds: [101],
};

const clearSessionMock = vi.fn();

type MockAuthStoreState = {
  session: UserSession | null;
  setSession: (nextSession: UserSession) => void;
  clearSession: () => void;
};

function SidebarHarness() {
  const [expanded, setExpanded] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <div data-testid="sidebar-state">{expanded ? "expanded" : "collapsed"}</div>
        <div data-testid="outside">외부 영역</div>
        <AppShellSidebar
          isDesktopViewport
          isSidebarExpanded={expanded}
          onDesktopSidebarExpandedChange={setExpanded}
        />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function renderAppShellHeader() {
  const view = render(<SidebarHarness />);
  const sidebar = view.container.querySelector("aside.app-sidebar");

  expect(sidebar).not.toBeNull();

  return {
    ...view,
    sidebar: sidebar as HTMLElement,
    sidebarState: screen.getByTestId("sidebar-state"),
    outside: screen.getByTestId("outside"),
  };
}

function queryPanelContent(label: string) {
  return document.querySelector(
    `[data-slot="popover-content"][aria-label="${label}"]`,
  ) as HTMLElement | null;
}

function getPanelContent(label: string) {
  const panelContent = queryPanelContent(label);

  expect(panelContent).not.toBeNull();

  return panelContent as HTMLElement;
}

beforeEach(() => {
  vi.clearAllMocks();
  clearSessionMock.mockReset();

  mockedUseNotificationsQuery.mockReturnValue(asQueryResult<ReturnType<typeof notificationQueries.useNotificationsQuery>>({
    data: [],
    isLoading: false,
    isError: false,
    status: "success",
  }));
  mockedUseProjectApprovalsQuery.mockReturnValue(asQueryResult<ReturnType<typeof projectQueries.useProjectApprovalsQuery>>({
    data: [],
    isLoading: false,
    isError: false,
    status: "success",
  }));
  mockedUseAuthStore.mockImplementation(((
    selector: (state: MockAuthStoreState) => unknown,
  ) =>
    selector({
      session,
      setSession: vi.fn(),
      clearSession: clearSessionMock,
    })) as unknown as typeof authStore.useAuthStore);
});

describe("AppShellSidebar", () => {
  it("attention 데이터가 아직 준비되지 않았으면 숫자 badge를 렌더링하지 않는다", () => {
    mockedUseNotificationsQuery.mockReturnValue(asQueryResult<ReturnType<typeof notificationQueries.useNotificationsQuery>>({
      data: undefined,
      isLoading: true,
      isError: false,
      status: "pending",
    }));
    mockedUseProjectApprovalsQuery.mockReturnValue(asQueryResult<ReturnType<typeof projectQueries.useProjectApprovalsQuery>>({
      data: undefined,
      isLoading: true,
      isError: false,
      status: "pending",
    }));

    const { container } = renderAppShellHeader();

    expect(container.querySelector('[data-slot="badge"][data-variant="attention"]')).toBeNull();
  });

  it("읽지 않은 알림과 승인 대기를 합산한 숫자 badge를 빨간 원형으로 보여준다", () => {
    mockedUseNotificationsQuery.mockReturnValue(asQueryResult<ReturnType<typeof notificationQueries.useNotificationsQuery>>({
      data: [
        {
          id: 1,
          type: "asset-approved",
          targetType: "asset",
          targetId: 10,
          message: "첫 번째 알림",
          createdAt: "2026-03-17T10:00:00.000Z",
          readAt: null,
        },
        {
          id: 2,
          type: "qna-comment",
          targetType: "board",
          targetId: 11,
          message: "두 번째 알림",
          createdAt: "2026-03-17T11:00:00.000Z",
          readAt: null,
        },
      ],
      isLoading: false,
      isError: false,
      status: "success",
    }));
    mockedUseProjectApprovalsQuery.mockReturnValue(asQueryResult<ReturnType<typeof projectQueries.useProjectApprovalsQuery>>({
      data: [
        {
          id: 7,
          slug: "attention-asset",
          title: "승인 대기 자산",
          projectId: 101,
          projectName: "플랫폼 프로젝트",
          authorName: "관리자",
          createdAt: "2026-03-17T09:00:00.000Z",
        },
      ],
      isLoading: false,
      isError: false,
      status: "success",
    }));

    const { container } = renderAppShellHeader();
    const badge = container.querySelector('[data-slot="badge"][data-variant="attention"]');

    expect(badge).not.toBeNull();
    expect(badge).toHaveTextContent("3");
  });

  it("유저 메뉴가 닫힌 상태에서는 hover 진입 시 확장되고 외부 이탈 시 다시 접힌다", () => {
    const { outside, sidebar, sidebarState } = renderAppShellHeader();

    fireEvent.pointerEnter(sidebar);

    expect(sidebarState).toHaveTextContent("expanded");

    fireEvent.pointerLeave(sidebar, { relatedTarget: outside });

    expect(sidebarState).toHaveTextContent("collapsed");
  });

  it("유저 패널을 열고 사이드바에서 패널로 이동하면 확장이 유지된다", async () => {
    const user = userEvent.setup();
    const { sidebar, sidebarState } = renderAppShellHeader();

    await user.click(screen.getByRole("button", { name: "유저 메뉴" }));

    expect(sidebarState).toHaveTextContent("expanded");
    const userPanelContent = getPanelContent("유저 패널");

    fireEvent.pointerLeave(sidebar, { relatedTarget: userPanelContent });

    expect(sidebarState).toHaveTextContent("expanded");
    expect(screen.getByText("로그아웃")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "유저 메뉴" })).toBeInTheDocument();
  });

  it("알림 패널을 열고 사이드바에서 패널로 이동하면 확장이 유지된다", async () => {
    const user = userEvent.setup();
    const { sidebar, sidebarState } = renderAppShellHeader();

    await user.click(screen.getByRole("button", { name: "알림" }));

    expect(sidebarState).toHaveTextContent("expanded");
    const noticePanelContent = getPanelContent("알림 패널");

    fireEvent.pointerLeave(sidebar, { relatedTarget: noticePanelContent });

    expect(sidebarState).toHaveTextContent("expanded");
    expect(screen.getByText("전체 보기")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "알림" })).toBeInTheDocument();
  });

  it("사이드바와 유저 패널 영역을 모두 벗어나면 지연 없이 즉시 닫힌다", async () => {
    const user = userEvent.setup();
    const { outside, sidebar, sidebarState } = renderAppShellHeader();

    await user.click(screen.getByRole("button", { name: "유저 메뉴" }));
    const userPanelContent = getPanelContent("유저 패널");

    fireEvent.pointerLeave(sidebar, { relatedTarget: userPanelContent });
    fireEvent.pointerLeave(userPanelContent, { relatedTarget: outside });

    await waitFor(() => {
      expect(queryPanelContent("유저 패널")).toBeNull();
    });
    expect(sidebarState).toHaveTextContent("collapsed");
  });

  it("사이드바와 알림 패널 영역을 모두 벗어나면 지연 없이 즉시 닫힌다", async () => {
    const user = userEvent.setup();
    const { outside, sidebar, sidebarState } = renderAppShellHeader();

    await user.click(screen.getByRole("button", { name: "알림" }));
    const noticePanelContent = getPanelContent("알림 패널");

    fireEvent.pointerLeave(sidebar, { relatedTarget: noticePanelContent });
    fireEvent.pointerLeave(noticePanelContent, { relatedTarget: outside });

    await waitFor(() => {
      expect(queryPanelContent("알림 패널")).toBeNull();
    });
    expect(sidebarState).toHaveTextContent("collapsed");
  });

  it("패널을 닫을 때 포인터가 아직 사이드바 안에 있으면 사이드바 확장은 유지된다", async () => {
    const user = userEvent.setup();
    const { sidebar, sidebarState } = renderAppShellHeader();

    fireEvent.pointerEnter(sidebar);
    await user.click(screen.getByRole("button", { name: "유저 메뉴" }));
    getPanelContent("유저 패널");

    await user.click(screen.getByRole("button", { name: "유저 메뉴" }));

    await waitFor(() => {
      expect(queryPanelContent("유저 패널")).toBeNull();
    });
    expect(sidebarState).toHaveTextContent("expanded");
  });

  it("유저 패널이 열린 상태에서 알림을 열면 알림 패널만 남는다", async () => {
    const user = userEvent.setup();
    const { sidebarState } = renderAppShellHeader();

    await user.click(screen.getByRole("button", { name: "유저 메뉴" }));
    getPanelContent("유저 패널");

    await user.click(screen.getByRole("button", { name: "알림" }));

    await waitFor(() => {
      expect(queryPanelContent("유저 패널")).toBeNull();
    });
    expect(getPanelContent("알림 패널")).toBeInTheDocument();
    expect(sidebarState).toHaveTextContent("expanded");
  });
});
