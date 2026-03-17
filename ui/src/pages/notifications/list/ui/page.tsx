/**
 * 목적: 사용자 알림 내역을 렌더링한다.
 * 설명: 승인 결과와 댓글 알림을 읽음 처리와 함께 제공한다.
 * 적용 패턴: 알림 목록 패턴
 * 참조: ui/src/shared/api/hooks.ts
 */
import { Link } from "react-router-dom";

import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import { useNotificationsQuery } from "@/entities/notification/model/queries";
import { useReadNotificationMutation } from "@/features/notification-actions/model/mutations";
import { formatDateTime } from "@/shared/lib/format";
import { SectionHero } from "@/shared/ui/section-hero";

export function NotificationsPage() {
  const notificationsQuery = useNotificationsQuery();
  const readMutation = useReadNotificationMutation();

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="알림"
        title="알림 내역"
        description="자산 승인 결과와 댓글 알림을 확인하고 바로 대상 상세로 이동할 수 있습니다."
      />

      <div className="page-stagger-group grid gap-4">
        {(notificationsQuery.data ?? []).map((item) => {
          const href =
            item.targetType === "asset" ? `/assets/${item.targetId}` : `/board/qna/${item.targetId}`;

          return (
            <Card key={item.id} className="surface-panel rounded-lg border-border bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg">{item.message}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <div>{formatDateTime(item.createdAt)}</div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="rounded-md border-border bg-background">
                    <Link to={href}>대상 보기</Link>
                  </Button>
                  {!item.readAt ? (
                    <Button type="button" className="rounded-md" onClick={() => readMutation.mutate(item.id)}>
                      읽음 처리
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
