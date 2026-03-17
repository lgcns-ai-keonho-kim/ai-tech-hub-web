/**
 * 목적: 앱 셸 네비게이션 구성을 별도 설정 파일로 분리한다.
 * 설명: 사이드바 아이템과 아이콘 매핑을 제어 로직에서 분리해 앱 셸 책임을 줄인다.
 * 적용 패턴: 정적 구성 패턴
 * 참조: ui/src/widgets/app-shell-header.tsx, ui/src/widgets/app-shell/ui/sidebar-frame.tsx
 */
import {
  Bell,
  BookOpen,
  Code2,
  FolderKanban,
  House,
  MessageSquareText,
  NotebookPen,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { assetKindOptions } from "@/entities/asset/lib/labels";

export const appShellIcons = {
  bell: Bell,
} as const;

const assetKindIconMap = {
  code: Code2,
  knowledge: BookOpen,
  troubleshooting: TriangleAlert,
  lesson: NotebookPen,
} as const;

export const primaryMenus: Array<{
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}> = [
  { to: "/", label: "Home", icon: House, end: true },
  ...assetKindOptions.map((item) => ({
    to: item.path,
    label: item.label,
    icon: assetKindIconMap[item.value],
  })),
  { to: "/projects", label: "프로젝트", icon: FolderKanban },
  { to: "/board", label: "게시판", icon: MessageSquareText },
];

export type SidebarPanelKind = "notice" | "user";
