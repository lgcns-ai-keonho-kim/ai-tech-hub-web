/**
 * 목적: 로그인 후 진입하는 홈 허브 화면을 렌더링한다.
 * 설명: 게시판 피드와 2열 카드형 미니 대시보드를 통해 자산 종류별 핵심 지표와 진입점을 함께 제공한다.
 * 적용 패턴: 카드형 홈 대시보드 패턴
 * 참조: docs/superpowers/specs/2026-03-16-home-layout-design.md, ui/src/shared/constants/asset-domain.ts
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ChevronDown, Triangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/ui/primitives/empty";
import { Separator } from "@/shared/ui/primitives/separator";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { cn } from "@/shared/lib/cn";
import type { AssetKind } from "@/entities/asset/model/types";
import { useBoardPostsQuery } from "@/entities/board/model/queries";
import type { BoardPostSummary, BoardType } from "@/entities/board/model/types";
import { useProjectsQuery } from "@/entities/project/model/queries";
import { useHomeDashboardQuery } from "@/pages/dashboard/home/model/use-home-dashboard-query";
import { formatCompactNumber, formatDate } from "@/shared/lib/format";
import { AnimatedSlotNumber } from "@/shared/ui/animated-slot-number";
import { ProjectStageSummaryPanel } from "@/widgets/project-stage-summary-panel";

type HomeSection = {
  kind: AssetKind;
  label: string;
  eyebrow: string;
  description: string;
  path: string;
  accentDotClassName: string;
  accentEyebrowClassName: string;
  accentMetricClassName: string;
};

type HomeEditorialHeaderProps = {
  eyebrow: string;
  title: string;
  to?: string;
};

const homeSections: HomeSection[] = [
  {
    kind: "code",
    label: "코드 자산",
    eyebrow: "Code Assets",
    description: "저장소, 실행 패키지, 배포 가능한 도구를 빠르게 탐색합니다.",
    path: "/code-assets",
    accentDotClassName: "bg-sky-200/90 dark:bg-sky-300/70",
    accentEyebrowClassName: "text-sky-700/72 dark:text-sky-300/78",
    accentMetricClassName:
      "bg-[radial-gradient(circle_at_center,rgba(224,242,254,0.92)_0%,rgba(240,249,255,0.72)_42%,rgba(248,250,252,0)_78%)] dark:bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.16)_0%,rgba(56,189,248,0.08)_40%,rgba(15,23,42,0)_78%)]",
  },
  {
    kind: "knowledge",
    label: "지적 자산",
    eyebrow: "Knowledge Assets",
    description: "문서, 산출물, 구조화된 지식을 한 흐름으로 묶어 찾습니다.",
    path: "/knowledge-assets",
    accentDotClassName: "bg-rose-200/90 dark:bg-rose-300/70",
    accentEyebrowClassName: "text-rose-700/72 dark:text-rose-300/78",
    accentMetricClassName:
      "bg-[radial-gradient(circle_at_center,rgba(255,241,242,0.94)_0%,rgba(255,245,247,0.72)_42%,rgba(248,250,252,0)_78%)] dark:bg-[radial-gradient(circle_at_center,rgba(253,164,175,0.16)_0%,rgba(251,113,133,0.08)_40%,rgba(15,23,42,0)_78%)]",
  },
  {
    kind: "troubleshooting",
    label: "트러블슈팅",
    eyebrow: "Troubleshooting",
    description: "이슈와 해결 기록을 연결해 다시 같은 시행착오를 줄입니다.",
    path: "/troubleshooting",
    accentDotClassName: "bg-amber-200/90 dark:bg-amber-300/72",
    accentEyebrowClassName: "text-amber-700/72 dark:text-amber-300/78",
    accentMetricClassName:
      "bg-[radial-gradient(circle_at_center,rgba(255,251,235,0.94)_0%,rgba(255,247,237,0.72)_42%,rgba(248,250,252,0)_78%)] dark:bg-[radial-gradient(circle_at_center,rgba(252,211,77,0.16)_0%,rgba(245,158,11,0.08)_40%,rgba(15,23,42,0)_78%)]",
  },
  {
    kind: "lesson",
    label: "Lesson & Learned",
    eyebrow: "Lessons",
    description: "회고와 학습 정리를 모아 다음 작업의 판단 근거로 이어갑니다.",
    path: "/lessons",
    accentDotClassName: "bg-emerald-200/90 dark:bg-emerald-300/70",
    accentEyebrowClassName: "text-emerald-700/72 dark:text-emerald-300/78",
    accentMetricClassName:
      "bg-[radial-gradient(circle_at_center,rgba(236,253,245,0.94)_0%,rgba(240,253,244,0.72)_42%,rgba(248,250,252,0)_78%)] dark:bg-[radial-gradient(circle_at_center,rgba(110,231,183,0.16)_0%,rgba(16,185,129,0.08)_40%,rgba(15,23,42,0)_78%)]",
  },
];

function formatDelta(value: number) {
  if (value > 0) {
    return `+${formatCompactNumber(value)}`;
  }
  if (value < 0) {
    return `-${formatCompactNumber(Math.abs(value))}`;
  }
  return "0";
}

function resolveExpandedId(currentId: number | null, posts: BoardPostSummary[]) {
  if (posts.length === 0) {
    return null;
  }

  return currentId && posts.some((post) => post.id === currentId) ? currentId : null;
}

function HomeEditorialSectionHeader({
  eyebrow,
  title,
  to,
}: HomeEditorialHeaderProps) {
  return (
    <header className="relative flex w-full items-stretch gap-4 overflow-hidden px-5 py-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-0 w-[min(30rem,78%)] rounded-full bg-[linear-gradient(90deg,rgba(248,232,238,0.82)_0%,rgba(248,232,238,0.44)_28%,rgba(248,232,238,0.16)_54%,rgba(248,232,238,0)_78%)] dark:bg-[linear-gradient(90deg,rgba(248,232,238,0.16)_0%,rgba(248,232,238,0.1)_30%,rgba(248,232,238,0.04)_54%,rgba(248,232,238,0)_78%)]"
      />
      <div
        aria-hidden="true"
        className="relative z-10 mt-1 hidden w-px self-stretch rounded-full bg-gradient-to-b from-transparent via-foreground/45 to-transparent sm:block"
      />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-2">
        <div className="text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          {eyebrow}
        </div>
        <h1 className="text-2xl font-medium tracking-[-0.03em] text-foreground">{title}</h1>
      </div>
      {to ? (
        <div className="relative z-10 flex shrink-0 items-end">
          <Link
            to={to}
            className="text-xs font-normal text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
          >
            +더보기
          </Link>
        </div>
      ) : null}
    </header>
  );
}

function HomeBoardFeedSection({
  title,
  type,
  posts,
  isLoading,
  expandedPostId,
  onToggle,
}: {
  title: string;
  type: BoardType;
  posts: BoardPostSummary[];
  isLoading: boolean;
  expandedPostId: number | null;
  onToggle: (postId: number) => void;
}) {
  const moreTo = type === "notice" ? "/board" : "/board?tab=qna";
  const eyebrow = type === "notice" ? "Board Feed" : "Discussion";

  return (
    <section className="flex flex-col gap-8">
      <HomeEditorialSectionHeader eyebrow={eyebrow} title={title} to={moreTo} />
      <Card className="surface-panel rounded-lg border-border bg-background">
        <CardContent className="px-5 py-0">
          {isLoading ? (
            <div className="flex flex-col">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`${title}-skeleton-${index}`} className="flex flex-col">
                  <div className="px-5 py-5">
                    <div className="flex flex-col gap-3">
                      <Skeleton className="h-4 w-24 rounded-full" />
                      <Skeleton className="h-5 w-2/3 rounded-full" />
                      <Skeleton className="h-4 w-full rounded-full" />
                    </div>
                  </div>
                  {index < 2 ? <Separator /> : null}
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="feed-focus-list flex flex-col">
              {posts.map((post, index) => {
                const isExpanded = expandedPostId === post.id;

                return (
                  <div key={post.id} className="feed-focus-item flex flex-col">
                    <button
                      type="button"
                      className="w-full px-5 py-5 text-left transition-colors duration-150 ease-out hover:bg-muted/30"
                      onClick={() => onToggle(post.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium tracking-[0.14em]">
                              {type === "notice" ? "NOTICE" : "Q&A"}
                            </span>
                            <span>{formatDate(post.createdAt)}</span>
                            {type === "qna" ? <span>댓글 {post.commentCount}</span> : null}
                          </div>
                          <div className="text-base font-medium leading-6 text-foreground">
                            {post.title}
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            "mt-0.5 shrink-0 text-muted-foreground transition-transform duration-150 ease-out",
                            isExpanded && "rotate-180 text-foreground",
                          )}
                        />
                      </div>
                    </button>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5">
                          <div className="surface-panel-muted rounded-lg border border-border px-4 py-4">
                            <p className="text-sm leading-7 text-muted-foreground">
                              {post.contentPreview}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="text-xs text-muted-foreground">
                                {post.authorName}
                                {type === "qna" ? ` · 댓글 ${post.commentCount}` : ""}
                              </div>
                              <Link
                                to={`/board/${type}/${post.id}`}
                                className="text-xs text-foreground/80 transition-colors duration-150 ease-out hover:text-foreground"
                              >
                                {type === "notice" ? "공지사항 보기" : "게시글 보기"}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < posts.length - 1 ? <Separator /> : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty className="border-0 p-8">
              <EmptyHeader>
                <EmptyTitle>{title}이 아직 없습니다.</EmptyTitle>
                <EmptyDescription>
                  새 게시글이 등록되면 홈에서 바로 확인할 수 있습니다.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function HomeAssetSummaryCard({
  section,
  totalAssets,
  postDelta,
  commentDelta,
  pendingAssets,
  canSeePendingAssets,
}: {
  section: HomeSection;
  totalAssets: number;
  postDelta: number;
  commentDelta: number;
  pendingAssets: number;
  canSeePendingAssets: boolean;
}) {
  const summaryItems = [
    { label: "새 글", value: formatDelta(postDelta), emphasizeUp: true, rawValue: postDelta },
    { label: "새 댓글", value: formatDelta(commentDelta), emphasizeUp: true, rawValue: commentDelta },
    ...(canSeePendingAssets
      ? [{ label: "대기 승인", value: formatCompactNumber(pendingAssets), emphasizeUp: false, rawValue: pendingAssets }]
      : []),
  ];

  return (
    <Card className="surface-panel interactive-lift h-full rounded-xl border-border bg-background/96">
      <CardHeader className="gap-4 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  "size-3 rounded-full border border-white/60 shadow-sm dark:border-white/10",
                  section.accentDotClassName,
                )}
              />
              <span className={cn("text-[11px] font-medium tracking-[0.18em] uppercase", section.accentEyebrowClassName)}>
                {section.eyebrow}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <CardTitle className="text-xl text-foreground">{section.label}</CardTitle>
              <CardDescription className="max-w-none text-sm leading-6 line-clamp-2">
                {section.description}
              </CardDescription>
            </div>
          </div>
          <div
            className={cn(
              "hidden min-h-24 min-w-[7.25rem] shrink-0 rounded-2xl border border-border/60 px-4 py-3 text-center md:flex md:flex-col md:items-center md:justify-center md:gap-1",
              section.accentMetricClassName,
            )}
          >
            <div className="text-[11px] font-semibold tracking-[0.16em] text-foreground/82">
              TOTAL
            </div>
            <AnimatedSlotNumber
              value={totalAssets}
              format={formatCompactNumber}
              className="text-3xl font-medium tracking-[-0.04em] tabular-nums text-foreground"
              startWhenVisible
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex h-full flex-col justify-end gap-5 pt-0">
        <div className="flex items-end justify-between gap-4 md:hidden">
          <div className={cn("flex rounded-2xl border border-border/60 px-4 py-3 text-center", section.accentMetricClassName)}>
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-semibold tracking-[0.16em] text-foreground/82">
                TOTAL
              </div>
              <AnimatedSlotNumber
                value={totalAssets}
                format={formatCompactNumber}
                className="text-3xl font-medium tracking-[-0.04em] tabular-nums text-foreground"
                startWhenVisible
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/70 pt-4">
          {summaryItems.map((metric) => (
            <div
              key={`${section.kind}-${metric.label}`}
              className="flex min-w-0 flex-col items-center gap-1 text-center"
            >
              <div className="text-[11px] font-medium tracking-[0.04em] text-muted-foreground">
                {metric.label}
              </div>
              <div
                className={cn(
                  "inline-flex items-center justify-center gap-1 text-base font-medium tabular-nums text-foreground",
                  metric.emphasizeUp && metric.rawValue > 0 && "text-red-600 dark:text-red-400",
                  metric.emphasizeUp && metric.rawValue < 0 && "text-blue-600 dark:text-blue-400",
                )}
              >
                {metric.emphasizeUp && metric.rawValue !== 0 ? (
                  <Triangle
                    className={cn(
                      "size-3 fill-current stroke-none",
                      metric.rawValue < 0 && "rotate-180",
                    )}
                  />
                ) : null}
                <span>{metric.value}</span>
              </div>
            </div>
          ))}
          {summaryItems.length % 2 === 1 ? <div aria-hidden="true" /> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function HomePage() {
  const dashboardQuery = useHomeDashboardQuery();
  const noticePostsQuery = useBoardPostsQuery("notice");
  const projectsQuery = useProjectsQuery();
  const qnaPostsQuery = useBoardPostsQuery("qna");
  const dashboard = dashboardQuery.data;
  const latestNotices = useMemo(
    () => (noticePostsQuery.data ?? []).slice(0, 3),
    [noticePostsQuery.data],
  );
  const latestQnaPosts = useMemo(
    () => (qnaPostsQuery.data ?? []).slice(0, 3),
    [qnaPostsQuery.data],
  );
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);
  const [expandedQnaId, setExpandedQnaId] = useState<number | null>(null);

  useEffect(() => {
    setExpandedNoticeId((currentId) => resolveExpandedId(currentId, latestNotices));
  }, [latestNotices]);

  useEffect(() => {
    setExpandedQnaId((currentId) => resolveExpandedId(currentId, latestQnaPosts));
  }, [latestQnaPosts]);

  return (
    <div className="relative isolate overflow-hidden">
      <div className="page-stagger relative z-10 flex flex-col gap-16">
        <HomeBoardFeedSection
          title="공지사항"
          type="notice"
          posts={latestNotices}
          isLoading={noticePostsQuery.isLoading && !noticePostsQuery.data}
          expandedPostId={expandedNoticeId}
          onToggle={(postId) =>
            setExpandedNoticeId((currentId) => (currentId === postId ? null : postId))
          }
        />

        <section className="flex flex-col gap-8">
          <HomeEditorialSectionHeader eyebrow="Asset Directory" title="모아보기" />
          <ProjectStageSummaryPanel
            projects={projectsQuery.data}
            className="w-full"
            chartContainerClassName="h-72 w-[92%]"
          />
          <div className="card-selection-grid page-stagger-group grid auto-rows-[248px] gap-4 md:grid-cols-2">
            {homeSections.map((section) => (
              <Link key={section.kind} to={section.path} className="card-selection-item block h-full w-full cursor-pointer">
                <HomeAssetSummaryCard
                  section={section}
                  totalAssets={dashboard?.sections[section.kind].totalAssets ?? 0}
                  postDelta={dashboard?.sections[section.kind].postDeltaFromYesterday ?? 0}
                  commentDelta={dashboard?.sections[section.kind].commentDeltaFromYesterday ?? 0}
                  pendingAssets={dashboard?.sections[section.kind].pendingAssets ?? 0}
                  canSeePendingAssets={dashboard?.canSeePendingAssets ?? false}
                />
              </Link>
            ))}
          </div>
        </section>

        <HomeBoardFeedSection
          title="Q&A"
          type="qna"
          posts={latestQnaPosts}
          isLoading={qnaPostsQuery.isLoading && !qnaPostsQuery.data}
          expandedPostId={expandedQnaId}
          onToggle={(postId) =>
            setExpandedQnaId((currentId) => (currentId === postId ? null : postId))
          }
        />
      </div>
    </div>
  );
}
