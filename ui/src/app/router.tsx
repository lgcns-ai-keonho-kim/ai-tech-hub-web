/**
 * 목적: 앱 라우트와 권한 게이트를 정의한다.
 * 설명: 로그인 페이지와 보호 레이아웃, 관리자 전용 라우트, 매니저 전용 라우트를 함께 구성한다.
 * 적용 패턴: 선언적 라우팅 패턴
 * 참조: ui/src/app/root-layout.tsx, ui/src/store/use-auth-store.ts
 */
import type { ReactNode } from "react";
import { Navigate, RouterProvider, createBrowserRouter, useParams } from "react-router-dom";

import { RootLayout } from "@/app/root-layout";
import { AdminCategoriesPage } from "@/pages/admin/categories/ui/page";
import { AdminDashboardPage } from "@/pages/admin/dashboard/ui/page";
import { AdminProjectsPage } from "@/pages/admin/projects/ui/page";
import { AdminUsersPage } from "@/pages/admin/users/ui/page";
import { BoardDetailPage } from "@/pages/board/detail/ui/page";
import { BoardPage } from "@/pages/board/list/ui/page";
import { HomePage } from "@/pages/dashboard/home/ui/page";
import { LoginPage } from "@/pages/auth/login/ui/page";
import { AssetDetailPage } from "@/pages/assets/detail/ui/page";
import { AssetFormPage } from "@/pages/assets/create/ui/page";
import { AssetListPage } from "@/pages/assets/list/ui/page";
import { MyAssetsPage } from "@/pages/me/assets/ui/page";
import { MyFavoritesPage } from "@/pages/me/favorites/ui/page";
import { MyProfilePage } from "@/pages/me/profile/ui/page";
import { ProjectApprovalsPage } from "@/pages/me/project-approvals/ui/page";
import { NotificationsPage } from "@/pages/notifications/list/ui/page";
import { ProjectDetailPage } from "@/pages/projects/detail/ui/page";
import { ProjectsPage } from "@/pages/projects/list/ui/page";
import { useAuthStore } from "@/entities/session/model/store";

function RequireApprovedUser({ children }: { children: ReactNode }) {
  const session = useAuthStore((state) => state.session);

  if (!session || session.user.accountStatus !== "approved") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const session = useAuthStore((state) => state.session);

  if (!session || session.user.globalRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RequireManager({ children }: { children: ReactNode }) {
  const session = useAuthStore((state) => state.session);

  if (!session || session.managedProjectIds.length === 0) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function LoginRoute() {
  const session = useAuthStore((state) => state.session);

  if (session?.user.accountStatus === "approved") {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

function KnowledgeCategoryRoute() {
  const params = useParams();
  return <AssetListPage kind="knowledge" categorySlug={params.slug} />;
}

function BoardLegacyRoute({ tab }: { tab: "notice" | "qna" }) {
  return <Navigate to={`/board${tab === "notice" ? "" : `?tab=${tab}`}`} replace />;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    path: "/",
    element: (
      <RequireApprovedUser>
        <RootLayout />
      </RequireApprovedUser>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "code-assets", element: <AssetListPage kind="code" /> },
      { path: "knowledge-assets", element: <AssetListPage kind="knowledge" /> },
      { path: "knowledge-assets/categories/:slug", element: <KnowledgeCategoryRoute /> },
      { path: "troubleshooting", element: <AssetListPage kind="troubleshooting" /> },
      { path: "lessons", element: <AssetListPage kind="lesson" /> },
      { path: "assets/new/:kind", element: <AssetFormPage /> },
      { path: "assets/:assetId", element: <AssetDetailPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/:projectId", element: <ProjectDetailPage /> },
      { path: "board", element: <BoardPage /> },
      { path: "board/notices", element: <BoardLegacyRoute tab="notice" /> },
      { path: "board/qna", element: <BoardLegacyRoute tab="qna" /> },
      { path: "board/:type/:postId", element: <BoardDetailPage /> },
      { path: "me/assets", element: <MyAssetsPage /> },
      { path: "me/favorites", element: <MyFavoritesPage /> },
      { path: "me/profile", element: <MyProfilePage /> },
      {
        path: "me/project-approvals",
        element: (
          <RequireManager>
            <ProjectApprovalsPage />
          </RequireManager>
        ),
      },
      { path: "notifications", element: <NotificationsPage /> },
      {
        path: "admin",
        element: (
          <RequireAdmin>
            <AdminDashboardPage />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/users",
        element: (
          <RequireAdmin>
            <AdminUsersPage />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/projects",
        element: (
          <RequireAdmin>
            <AdminProjectsPage />
          </RequireAdmin>
        ),
      },
      {
        path: "admin/categories",
        element: (
          <RequireAdmin>
            <AdminCategoriesPage />
          </RequireAdmin>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
