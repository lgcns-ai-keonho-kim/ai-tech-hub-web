/**
 * 목적: 관리자 사용자 카드 위젯을 제공한다.
 * 설명: 사용자별 권한 현황, 프로젝트 역할 편집, 승인/거절 액션을 페이지에서 분리해 재사용 가능하게 한다.
 * 적용 패턴: 프레젠테이션 컴포넌트 패턴
 * 참조: ui/src/pages/admin/users/ui/page.tsx
 */
import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import { Input } from "@/shared/ui/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/primitives/select";
import type { ProjectSummary } from "@/entities/project/model/types";
import type { AdminUserSummary } from "@/entities/user/model/types";

type AdminUserCardProps = {
  user: AdminUserSummary;
  projects: ProjectSummary[];
  reason: string;
  selectedProjectId: string;
  selectedRole: "user" | "manager";
  membershipPending: boolean;
  deleteMembershipPending: boolean;
  onReasonChange: (nextValue: string) => void;
  onProjectChange: (nextValue: string) => void;
  onRoleChange: (nextValue: "user" | "manager") => void;
  onApprove: () => void;
  onReject: () => void;
  onMembershipSave: () => void;
  onMembershipDelete: (projectId: number) => void;
};

export function AdminUserCard({
  user,
  projects,
  reason,
  selectedProjectId,
  selectedRole,
  membershipPending,
  deleteMembershipPending,
  onReasonChange,
  onProjectChange,
  onRoleChange,
  onApprove,
  onReject,
  onMembershipSave,
  onMembershipDelete,
}: AdminUserCardProps) {
  return (
    <Card className="surface-panel rounded-lg border-border bg-transparent">
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div>{user.email}</div>
        <div>상태 {user.accountStatus}</div>
        <div>전역 권한 {user.globalRole}</div>
        <div>관리 프로젝트 {user.managedProjects.join(", ") || "-"}</div>
        <div className="space-y-2">
          <div className="font-medium text-foreground">현재 프로젝트 역할</div>
          {user.projectMemberships.length ? (
            user.projectMemberships.map((membership) => (
              <div
                key={`${user.id}-${membership.projectId}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3"
              >
                <div>
                  <div className="font-medium text-foreground">{membership.projectName}</div>
                  <div className="text-xs text-muted-foreground">{membership.role}</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md border-border bg-background"
                  disabled={deleteMembershipPending}
                  onClick={() => onMembershipDelete(membership.projectId)}
                >
                  역할 제거
                </Button>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">지정된 프로젝트 역할이 없습니다.</div>
          )}
        </div>
        <Input
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="거절 사유 입력"
          className="h-9 rounded-md border-border bg-background"
        />
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_140px]">
          <Select value={selectedProjectId} onValueChange={onProjectChange}>
            <SelectTrigger className="h-9 rounded-md border-border bg-background">
              <SelectValue placeholder="프로젝트 검색" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border bg-background">
              {projects.map((project) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedRole} onValueChange={(value) => onRoleChange(value as "user" | "manager")}>
            <SelectTrigger className="h-9 rounded-md border-border bg-background">
              <SelectValue placeholder="역할" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border bg-background">
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-border bg-background"
            disabled={!selectedProjectId || membershipPending}
            onClick={onMembershipSave}
          >
            역할 반영
          </Button>
        </div>
        <div className="flex gap-2">
          <Button type="button" className="rounded-md" onClick={onApprove}>
            승인
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-border bg-background"
            onClick={onReject}
          >
            거절
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
