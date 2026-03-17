/**
 * 목적: 앱 셸 사이드바 프레젠테이션을 별도 위젯 파일로 분리한다.
 * 설명: 앱 셸 제어 로직과 화면 렌더링을 분리해 유지보수성과 재사용성을 높인다.
 * 적용 패턴: 프레젠테이션 컴포넌트 패턴
 * 참조: ui/src/widgets/app-shell-header.tsx, ui/src/widgets/app-shell/config/navigation.ts
 */
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { Link, NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

import { appShellIcons, primaryMenus, type SidebarPanelKind } from "@/widgets/app-shell/config/navigation";
import { Badge } from "@/shared/ui/primitives/badge";
import { Button } from "@/shared/ui/primitives/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/primitives/popover";
import { Separator } from "@/shared/ui/primitives/separator";
import { cn } from "@/shared/lib/cn";
import type { NotificationItem } from "@/entities/notification/model/types";
import type { ProjectApprovalItem } from "@/entities/project/model/types";
import { formatDateTime } from "@/shared/lib/format";
import { BrandMark } from "@/shared/ui/brand-mark";
import type { UserSession } from "@/entities/session/model/types";

type SidebarFrameProps = {
  expanded: boolean;
  hasApprovalsError: boolean;
  hasNotificationError: boolean;
  isAttentionReady: boolean;
  totalAttentionCount: number;
  unreadCount: number;
  unreadNotifications?: NotificationItem[];
  pendingApprovalCount: number;
  pendingApprovals?: ProjectApprovalItem[];
  session: UserSession | null;
  activePanel: SidebarPanelKind | null;
  noticePanelContentRef: RefObject<HTMLDivElement | null>;
  userPanelContentRef: RefObject<HTMLDivElement | null>;
  onPanelOpenChange: (panel: SidebarPanelKind, open: boolean) => void;
  onPanelRegionPointerLeave: (
    panel: SidebarPanelKind,
    event: ReactPointerEvent<HTMLElement>,
  ) => void;
  onNavigate: () => void;
  onSignOut: () => void;
};

export function SidebarFrame({
  expanded,
  hasApprovalsError,
  hasNotificationError,
  isAttentionReady,
  totalAttentionCount,
  unreadCount,
  unreadNotifications,
  pendingApprovalCount,
  pendingApprovals,
  session,
  activePanel,
  noticePanelContentRef,
  userPanelContentRef,
  onPanelOpenChange,
  onPanelRegionPointerLeave,
  onNavigate,
  onSignOut,
}: SidebarFrameProps) {
  const BellIcon = appShellIcons.bell;
  const shouldShowAttentionBadge = isAttentionReady && totalAttentionCount > 0;

  return (
    <div className="flex h-full w-full flex-col gap-4 px-3 py-4 transition-[padding,gap] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
      <div className="flex w-full flex-col gap-3 transition-[gap] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
        <Link
          to="/"
          aria-label="홈으로 이동"
          className={cn(
            "relative flex h-11 w-full items-center overflow-hidden rounded-xl px-2 py-2 transition-[padding,background-color] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent",
          )}
          onClick={onNavigate}
        >
          <BrandMark
            variant="lockup"
            className={cn(
              "absolute left-2 top-1/2 h-auto -translate-y-1/2 object-contain transition-[opacity,transform] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              expanded
                ? "opacity-100 translate-x-0"
                : "pointer-events-none opacity-0 -translate-x-2",
            )}
          />
          <BrandMark
            variant="signal"
            className={cn(
              "absolute left-1/2 top-1/2 size-[2.025rem] -translate-x-1/2 -translate-y-1/2 object-contain transition-[opacity,transform] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              expanded
                ? "pointer-events-none scale-90 opacity-0"
                : "scale-100 opacity-100",
            )}
          />
        </Link>

        <Popover
          modal={false}
          open={activePanel === "notice"}
          onOpenChange={(open) => onPanelOpenChange("notice", open)}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="default"
              className={cn(
                "relative h-11 w-full justify-start overflow-hidden rounded-xl border-transparent px-2 text-left shadow-none transition-[padding,background-color,color] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                "hover:bg-accent",
              )}
              aria-label="알림"
            >
              <BellIcon
                data-icon="inline-start"
                strokeWidth={1.6}
                className={cn(
                  "absolute top-1/2 transition-[left,transform] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  expanded
                    ? "left-3 -translate-y-1/2"
                    : "left-1/2 -translate-x-1/2 -translate-y-1/2",
                )}
              />
              <span
                className={cn(
                  "block w-full overflow-hidden whitespace-nowrap pl-10 text-left font-medium transition-[max-width,opacity,padding] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  expanded ? "max-w-24 opacity-100" : "max-w-0 pl-0 opacity-0",
                )}
              >
                알림
              </span>
              {shouldShowAttentionBadge ? (
                <Badge
                  variant="attention"
                  className={cn(
                    "items-center justify-center rounded-full px-0 text-[11px] font-medium tabular-nums transition-[top,right,transform] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    expanded
                      ? "absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      : "absolute top-0.5 right-1 min-w-5 h-5 px-1.5 py-0.5",
                  )}
                >
                  {totalAttentionCount}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            ref={noticePanelContentRef}
            align={expanded ? "start" : "end"}
            side="right"
            sideOffset={12}
            aria-label="알림 패널"
            className="w-[320px] max-w-[calc(100vw-2rem)] rounded-lg p-3"
            onPointerLeave={(event) => onPanelRegionPointerLeave("notice", event)}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-foreground">알림</div>
                <Button asChild variant="ghost" className="h-auto px-2 py-1 text-xs text-muted-foreground">
                  <Link to="/notifications" onClick={onNavigate}>
                    전체 보기
                  </Link>
                </Button>
              </div>
              {!isAttentionReady && !hasApprovalsError && !hasNotificationError ? (
                <div className="surface-panel-muted rounded-lg px-3 py-3 text-sm text-muted-foreground">
                  새 알림을 확인하는 중입니다.
                </div>
              ) : null}
              {pendingApprovalCount > 0 ? (
                <section className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-foreground">승인 대기</div>
                    <Badge variant="secondary" className="min-w-5 rounded-full px-1.5">
                      {pendingApprovalCount}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(pendingApprovals ?? []).map((asset) => (
                      <Link
                        key={asset.id}
                        to="/me/project-approvals"
                        className="surface-panel-muted block rounded-lg px-3 py-3 transition-colors hover:bg-accent"
                        onClick={onNavigate}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">
                              {asset.title}
                            </div>
                            <div className="mt-1 truncate text-xs text-muted-foreground">
                              {asset.projectName ?? "프로젝트 미지정"}
                            </div>
                          </div>
                          <div className="shrink-0 text-xs text-muted-foreground">승인 대기</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
              <section className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-foreground">읽지 않은 알림</div>
                  {unreadCount > 0 ? (
                    <Badge variant="secondary" className="min-w-5 rounded-full px-1.5">
                      {unreadCount}
                    </Badge>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  {hasNotificationError ? (
                    <div className="surface-panel-muted rounded-lg px-3 py-3 text-sm text-destructive">
                      알림을 불러오지 못했습니다.
                    </div>
                  ) : null}
                  {!hasNotificationError ? (unreadNotifications ?? []).map((item) => (
                    <Link
                      key={item.id}
                      to={item.targetType === "asset" ? `/assets/${item.targetId}` : `/board/qna/${item.targetId}`}
                      className="surface-panel-muted block rounded-lg px-3 py-3 transition-colors hover:bg-accent"
                      onClick={onNavigate}
                    >
                      <div className="text-sm text-foreground">{item.message}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</div>
                    </Link>
                  )) : null}
                  {!hasNotificationError && isAttentionReady && unreadCount === 0 ? (
                    <div className="surface-panel-muted rounded-lg px-3 py-3 text-sm text-muted-foreground">
                      알림이 없습니다.
                    </div>
                  ) : null}
                </div>
              </section>
              {hasApprovalsError ? (
                <div className="surface-panel-muted rounded-lg px-3 py-3 text-sm text-destructive">
                  승인 대기 목록을 불러오지 못했습니다.
                </div>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>

        {session ? (
          <Popover
            modal={false}
            open={activePanel === "user"}
            onOpenChange={(open) => onPanelOpenChange("user", open)}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "relative h-11 w-full justify-start overflow-hidden rounded-xl border-transparent px-2 text-left shadow-none transition-[padding,background-color] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-accent",
                )}
                aria-label="유저 메뉴"
              >
                <span
                  className={cn(
                    "absolute top-1/2 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-[left,transform] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    expanded
                      ? "left-2 -translate-y-1/2"
                      : "left-1/2 -translate-x-1/2 -translate-y-1/2",
                  )}
                >
                  {session.user.name.slice(0, 1)}
                </span>
                <span
                  className={cn(
                    "block w-full overflow-hidden whitespace-nowrap pl-11 text-left text-sm font-medium transition-[max-width,opacity,padding] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    expanded ? "max-w-[140px] opacity-100" : "max-w-0 pl-0 opacity-0",
                  )}
                >
                  {session.user.name}
                </span>
                {!expanded ? <span className="sr-only">{session.user.name}</span> : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              ref={userPanelContentRef}
              align={expanded ? "start" : "end"}
              side="right"
              sideOffset={4}
              aria-label="유저 패널"
              className="w-64 overflow-visible rounded-lg p-0"
              onPointerLeave={(event) => onPanelRegionPointerLeave("user", event)}
            >
              <div className="relative flex flex-col">
                <div className="absolute inset-y-0 -left-4 w-4" aria-hidden="true" />
                <div className="px-3 py-3">
                  <div className="font-medium text-foreground">{session.user.name}</div>
                  <div className="mt-1 text-xs normal-case tracking-normal text-muted-foreground">
                    {session.user.email}
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-1 p-1">
                  <Button asChild variant="ghost" className="h-auto justify-start rounded-md px-3 py-2">
                    <Link to="/me/assets" onClick={onNavigate}>내 자산</Link>
                  </Button>
                  <Button asChild variant="ghost" className="h-auto justify-start rounded-md px-3 py-2">
                    <Link to="/me/favorites" onClick={onNavigate}>즐겨찾기</Link>
                  </Button>
                  <Button asChild variant="ghost" className="h-auto justify-start rounded-md px-3 py-2">
                    <Link to="/me/profile" onClick={onNavigate}>MyPage</Link>
                  </Button>
                  {session.managedProjectIds.length > 0 ? (
                    <Button asChild variant="ghost" className="h-auto justify-start rounded-md px-3 py-2">
                      <Link to="/me/project-approvals" onClick={onNavigate}>프로젝트 자산 관리</Link>
                    </Button>
                  ) : null}
                  {session.user.globalRole === "admin" ? (
                    <Button asChild variant="ghost" className="h-auto justify-start rounded-md px-3 py-2">
                      <Link to="/admin" onClick={onNavigate}>관리자 페이지</Link>
                    </Button>
                  ) : null}
                </div>
                <Separator />
                <div className="p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-md px-3 py-2"
                    onClick={onSignOut}
                  >
                    로그아웃
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>

      <nav className="mt-2 flex w-full flex-1 flex-col gap-1 transition-[gap] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
        {primaryMenus.map((item) => (
          <SidebarNavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            end={item.end}
            expanded={expanded}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  );
}

function SidebarNavItem({
  to,
  label,
  icon: Icon,
  end,
  expanded,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  expanded: boolean;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={expanded ? undefined : label}
      title={expanded ? undefined : label}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group/nav-item relative flex min-h-11 w-full items-center overflow-hidden rounded-xl border border-transparent px-2 py-3 text-sm transition-[background-color,border-color,color] duration-150 ease-out hover:border-border/60 hover:bg-accent hover:text-foreground",
          isActive && "border-primary/15 bg-primary text-primary-foreground hover:border-primary/15 hover:bg-primary/90 hover:text-primary-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary-foreground transition-[opacity] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              expanded && isActive ? "opacity-100" : "opacity-0",
            )}
          />
          <Icon
            strokeWidth={1.7}
            className={cn(
              "absolute top-1/2 transition-[left,transform] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              expanded
                ? "left-3 -translate-y-1/2"
                : "left-1/2 -translate-x-1/2 -translate-y-1/2",
            )}
          />
          <span
            className={cn(
              "block overflow-hidden whitespace-nowrap pl-10 transition-[max-width,opacity,padding] duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              expanded ? "max-w-[10rem] opacity-100" : "max-w-0 pl-0 opacity-0",
            )}
          >
            {label}
          </span>
          {!expanded ? <span className="sr-only">{label}</span> : null}
        </>
      )}
    </NavLink>
  );
}
