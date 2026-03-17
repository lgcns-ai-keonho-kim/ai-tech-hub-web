/**
 * 목적: 관리자 삭제 영향도 미리보기 패널을 공용 피처로 제공한다.
 * 설명: 프로젝트/카테고리 삭제 전에 연결 자산 영향을 같은 카드 레이아웃으로 보여준다.
 * 적용 패턴: 프레젠테이션 컴포넌트 패턴
 * 참조: ui/src/pages/admin-projects-page.tsx, ui/src/pages/admin-categories-page.tsx
 */
export function DeletePreviewPanel({
  totalAssetCount,
  assetsByKind,
  assetsByCategory,
}: {
  totalAssetCount: number;
  assetsByKind: Array<{ kind: string; count: number }>;
  assetsByCategory?: Array<{ categoryId: number; categoryName: string; count: number }>;
}) {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <div>연결된 자산은 총 {totalAssetCount}건입니다.</div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="mb-3 font-medium text-foreground">자산 종류별</div>
          <div className="space-y-2">
            {assetsByKind.map((item) => (
              <div key={item.kind} className="flex items-center justify-between gap-3">
                <span>{item.kind}</span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        {assetsByCategory ? (
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-3 font-medium text-foreground">카테고리별</div>
            <div className="space-y-2">
              {assetsByCategory.map((item) => (
                <div
                  key={`${item.categoryId}-${item.categoryName}`}
                  className="flex items-center justify-between gap-3"
                >
                  <span>{item.categoryName}</span>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
