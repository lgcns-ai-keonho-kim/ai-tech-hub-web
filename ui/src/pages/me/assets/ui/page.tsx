/**
 * 목적: 내가 등록한 자산과 요약 지표를 보여준다.
 * 설명: 사용자 소유 자산 대시보드와 목록을 한 화면에 제공한다.
 * 적용 패턴: 개인 대시보드 패턴
 * 참조: ui/src/shared/api/hooks.ts
 */
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import { useMyAssetDashboardQuery, useMyAssetsQuery } from "@/entities/asset/model/queries";
import { formatCompactNumber } from "@/shared/lib/format";
import { MetricChip } from "@/shared/ui/metric-chip";
import { SectionHero } from "@/shared/ui/section-hero";

export function MyAssetsPage() {
  const dashboardQuery = useMyAssetDashboardQuery();
  const assetsQuery = useMyAssetsQuery();

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="내 자산"
        title="내가 등록한 자산"
        description="등록 자산 수와 누적 다운로드, 좋아요, 즐겨찾기 수를 함께 확인합니다."
      />

      <section className="page-stagger-group grid gap-4 md:grid-cols-4">
        <MetricChip label="등록 자산" value={formatCompactNumber(dashboardQuery.data?.totalAssets ?? 0)} />
        <MetricChip label="다운로드" value={formatCompactNumber(dashboardQuery.data?.totalDownloads ?? 0)} />
        <MetricChip label="좋아요" value={formatCompactNumber(dashboardQuery.data?.totalLikes ?? 0)} />
        <MetricChip label="즐겨찾기" value={formatCompactNumber(dashboardQuery.data?.totalFavorites ?? 0)} />
      </section>

      <div className="page-stagger-group grid gap-4">
        {(assetsQuery.data ?? []).map((asset) => (
          <Link key={asset.id} to={`/assets/${asset.id}`} className="block">
            <Card className="surface-panel rounded-lg border-border bg-transparent">
              <CardHeader>
                <CardTitle>{asset.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{asset.summary}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
