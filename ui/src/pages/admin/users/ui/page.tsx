/**
 * 목적: 사용자 승인/거절과 권한 현황 화면을 제공한다.
 * 설명: 계정 상태, 전역 권한, 관리 프로젝트를 확인하고 승인 흐름을 처리한다.
 * 적용 패턴: 관리자 목록 화면 패턴
 * 참조: ui/src/pages/admin/users/model/use-admin-user-management-state.ts, ui/src/widgets/admin-users/ui/admin-user-card.tsx
 */
import {
  useApproveUserMutation,
  useDeleteProjectMembershipMutation,
  useRejectUserMutation,
  useUpdateProjectMembershipMutation,
} from "@/features/admin-users/model/mutations";
import { useProjectsQuery } from "@/entities/project/model/queries";
import { useAdminUsersQuery } from "@/entities/user/model/queries";
import { useAdminUserManagementState } from "@/pages/admin/users/model/use-admin-user-management-state";
import { SectionHero } from "@/shared/ui/section-hero";
import { AdminUserCard } from "@/widgets/admin-users/ui/admin-user-card";

export function AdminUsersPage() {
  const usersQuery = useAdminUsersQuery();
  const projectsQuery = useProjectsQuery();
  const approveMutation = useApproveUserMutation();
  const rejectMutation = useRejectUserMutation();
  const membershipMutation = useUpdateProjectMembershipMutation();
  const deleteMembershipMutation = useDeleteProjectMembershipMutation();
  const userManagementState = useAdminUserManagementState();

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="Admin"
        title="사용자 권한 관리"
        description="가입 승인/거절과 프로젝트 매니저 현황을 확인합니다."
      />

      <div className="page-stagger-group grid gap-4">
        {(usersQuery.data ?? []).map((user) => (
          <AdminUserCard
            key={user.id}
            user={user}
            projects={projectsQuery.data ?? []}
            reason={userManagementState.reasons[user.id] ?? ""}
            selectedProjectId={userManagementState.selectedProjectIds[user.id] ?? ""}
            selectedRole={userManagementState.selectedRoles[user.id] ?? "user"}
            membershipPending={membershipMutation.isPending}
            deleteMembershipPending={deleteMembershipMutation.isPending}
            onReasonChange={(nextValue) =>
              userManagementState.setReasons((current) => ({ ...current, [user.id]: nextValue }))
            }
            onProjectChange={(nextValue) =>
              userManagementState.setSelectedProjectIds((current) => ({ ...current, [user.id]: nextValue }))
            }
            onRoleChange={(nextValue) =>
              userManagementState.setSelectedRoles((current) => ({ ...current, [user.id]: nextValue }))
            }
            onApprove={() => approveMutation.mutate(user.id)}
            onReject={() =>
              rejectMutation.mutate({
                userId: user.id,
                reason: userManagementState.reasons[user.id] ?? "가입 승인 보류",
              })
            }
            onMembershipSave={() =>
              membershipMutation.mutate({
                userId: user.id,
                projectId: Number(userManagementState.selectedProjectIds[user.id]),
                role: userManagementState.selectedRoles[user.id] ?? "user",
              })
            }
            onMembershipDelete={(projectId) =>
              deleteMembershipMutation.mutate({
                userId: user.id,
                projectId,
              })
            }
          />
        ))}
      </div>
    </div>
  );
}
