/**
 * 목적: 매니저의 프로젝트 자산 승인/거절 화면을 제공한다.
 * 설명: 승인 대기 자산 목록을 표시하고 즉시 승인 또는 거절할 수 있게 한다.
 * 적용 패턴: 작업 대기열 패턴
 * 참조: ui/src/shared/api/hooks.ts
 */
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import { Input } from "@/shared/ui/primitives/input";
import { useProjectApprovalsQuery } from "@/entities/project/model/queries";
import {
  useApproveProjectAssetMutation,
  useRejectProjectAssetMutation,
} from "@/features/project-approval/model/mutations";
import { SectionHero } from "@/shared/ui/section-hero";

export function ProjectApprovalsPage() {
  const approvalsQuery = useProjectApprovalsQuery();
  const approveMutation = useApproveProjectAssetMutation();
  const rejectMutation = useRejectProjectAssetMutation();
  const [reasons, setReasons] = useState<Record<number, string>>({});

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="프로젝트 자산 관리"
        title="매니저 승인 대기열"
        description="내가 관리하는 프로젝트에 연결된 자산만 승인 또는 거절할 수 있습니다."
      />

      <div className="page-stagger-group grid gap-4">
        {(approvalsQuery.data ?? []).map((asset) => (
          <Card key={asset.id} className="surface-panel rounded-lg border-border bg-transparent">
            <CardHeader>
              <CardTitle>
                <Link to={`/assets/${asset.id}`}>{asset.title}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">{asset.summary}</p>
              <Input
                value={reasons[asset.id] ?? ""}
                onChange={(event) =>
                  setReasons((current) => ({ ...current, [asset.id]: event.target.value }))
                }
                placeholder="거절 사유 입력"
                className="h-9 rounded-md border-border bg-background"
              />
              <div className="flex gap-2">
                <Button type="button" className="rounded-md" onClick={() => approveMutation.mutate(asset.id)}>
                  승인
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md border-border bg-background"
                  onClick={() =>
                    rejectMutation.mutate({
                      assetId: asset.id,
                      reason: reasons[asset.id] ?? "요구사항 보완 필요",
                    })
                  }
                >
                  거절
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
