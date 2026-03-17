/**
 * 목적: 프로젝트 상세와 연결 자산 탭을 렌더링한다.
 * 설명: 지식 자산, 트러블슈팅, Lesson & Learned를 같은 상세 화면 안에서 전환해 보여준다.
 * 적용 패턴: 탭 상세 화면 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/shared/constants/asset-domain.ts
 */
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/shared/ui/primitives/badge";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";
import type { AssetKind } from "@/entities/asset/model/types";
import { getAssetKindLabel } from "@/entities/asset/lib/labels";
import { useProjectDetailQuery } from "@/entities/project/model/queries";
import { PageLoadingOverlay } from "@/shared/ui/page-loading-overlay";
import { SectionHero } from "@/shared/ui/section-hero";

const projectAssetKinds: AssetKind[] = ["knowledge", "troubleshooting", "lesson"];

export function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const projectQuery = useProjectDetailQuery(Number.isFinite(projectId) ? projectId : undefined);
  const [activeKind, setActiveKind] = useState<AssetKind>("knowledge");

  const filteredAssets = useMemo(
    () => (projectQuery.data?.assets ?? []).filter((asset) => asset.kind === activeKind),
    [activeKind, projectQuery.data?.assets],
  );

  if (!projectQuery.data) {
    return <PageLoadingOverlay message="프로젝트 정보를 불러오는 중입니다." />;
  }

  const { project } = projectQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="프로젝트 상세"
        title={project.name}
        description={project.summary}
        meta={(
          <>
            <Badge variant="outline" className="rounded-md border-border bg-background">
              고객사 {project.customerName}
            </Badge>
            {project.managerNames.map((manager) => (
              <Badge key={manager} variant="outline" className="rounded-md border-border bg-background">
                {manager}
              </Badge>
            ))}
          </>
        )}
      />

      <Tabs value={activeKind} onValueChange={(value) => setActiveKind(value as AssetKind)}>
        <TabsList variant="line" className="w-full justify-start gap-2 rounded-md border border-border bg-transparent p-1">
          {projectAssetKinds.map((kind) => (
            <TabsTrigger key={kind} value={kind}>
              {getAssetKindLabel(kind)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="page-stagger-group grid gap-4">
        {filteredAssets.map((asset) => (
          <Link key={asset.id} to={`/assets/${asset.id}`} className="surface-panel rounded-lg p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-md border-border bg-background">{asset.categoryName}</Badge>
              <Badge variant="outline" className="rounded-md border-border bg-background">{asset.ownerName}</Badge>
            </div>
            <div className="mt-3 text-xl font-medium tracking-[-0.04em]">{asset.title}</div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{asset.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
