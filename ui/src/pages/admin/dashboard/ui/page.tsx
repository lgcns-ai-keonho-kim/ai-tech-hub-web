/**
 * 목적: 관리자 대시보드 화면을 렌더링한다.
 * 설명: 총 사용자 수와 자산 현황을 타입, 상태, 프로젝트, 카테고리 기준으로 요약한다.
 * 적용 패턴: 관리자 KPI 대시보드 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/shared/api/types.ts
 */
import { Link } from "react-router-dom";

import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import { useAdminDashboardQuery } from "@/pages/admin/dashboard/model/use-admin-dashboard-query";
import { formatCompactNumber } from "@/shared/lib/format";
import { MetricChip } from "@/shared/ui/metric-chip";
import { SectionHero } from "@/shared/ui/section-hero";

export function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboardQuery();
  const dashboard = dashboardQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="Admin"
        title="관리자 대시보드"
        description="사용자 승인 현황과 자산 분포를 프로젝트, 카테고리, 상태 기준으로 확인합니다."
        actions={(
          <>
            <Button asChild className="rounded-md">
              <Link to="/admin/users">사용자 권한 관리</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-md border-border bg-background">
              <Link to="/admin/projects">프로젝트 관리</Link>
            </Button>
          </>
        )}
      />

      <section className="page-stagger-group grid gap-4 md:grid-cols-4">
        <MetricChip label="총 사용자 수" value={formatCompactNumber(dashboard?.totalUsers ?? 0)} />
        <MetricChip label="총 자산 수" value={formatCompactNumber(dashboard?.totalAssets ?? 0)} />
        <MetricChip label="승인 대기" value={formatCompactNumber(dashboard?.assetsByStatus.pending ?? 0)} />
        <MetricChip label="공개 자산" value={formatCompactNumber(dashboard?.assetsByStatus.approved ?? 0)} />
      </section>

      <section className="page-stagger-group grid gap-4 xl:grid-cols-3">
        <Card className="surface-panel rounded-lg border-border bg-transparent">
          <CardHeader>
            <CardTitle>자산 타입 분포</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>코드 자산 {dashboard?.assetsByKind.code ?? 0}</div>
            <div>지식 자산 {dashboard?.assetsByKind.knowledge ?? 0}</div>
            <div>트러블슈팅 {dashboard?.assetsByKind.troubleshooting ?? 0}</div>
            <div>Lesson & Learned {dashboard?.assetsByKind.lesson ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="surface-panel rounded-lg border-border bg-transparent">
          <CardHeader>
            <CardTitle>프로젝트별 자산</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {(dashboard?.assetsByProject ?? []).slice(0, 6).map((item) => (
              <div key={item.projectId} className="flex items-center justify-between gap-3">
                <span>{item.projectName}</span>
                <span>{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="surface-panel rounded-lg border-border bg-transparent">
          <CardHeader>
            <CardTitle>카테고리별 자산</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {(dashboard?.assetsByCategory ?? []).slice(0, 6).map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between gap-3">
                <span>{item.categoryName}</span>
                <span>{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
