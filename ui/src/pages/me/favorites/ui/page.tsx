/**
 * 목적: 즐겨찾기/좋아요/다운로드 이력을 보여준다.
 * 설명: 개인 상호작용 이력을 탭으로 전환하며 같은 목록 패턴으로 렌더링한다.
 * 적용 패턴: 탭 목록 패턴
 * 참조: ui/src/shared/api/hooks.ts
 */
import { useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";
import { useMyDownloadsQuery, useMyFavoritesQuery } from "@/entities/asset/model/queries";
import { SectionHero } from "@/shared/ui/section-hero";

type FavoriteTab = "favorites" | "downloads";

export function MyFavoritesPage() {
  const [tab, setTab] = useState<FavoriteTab>("favorites");
  const favoritesQuery = useMyFavoritesQuery();
  const downloadsQuery = useMyDownloadsQuery();
  const assets = tab === "favorites" ? favoritesQuery.data ?? [] : downloadsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="내 기록"
        title="즐겨찾기와 다운로드 이력"
        description="자주 다시 보는 자산과 실제 다운로드한 자산을 빠르게 다시 찾을 수 있습니다."
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as FavoriteTab)}>
        <TabsList variant="line" className="w-full justify-start gap-2 rounded-md border border-border bg-transparent p-1">
          <TabsTrigger value="favorites">즐겨찾기/좋아요</TabsTrigger>
          <TabsTrigger value="downloads">다운로드</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="page-stagger-group grid gap-4">
        {assets.map((asset) => (
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
