/**
 * 목적: 앱 셸 네비게이션 구성을 별도 설정 파일로 분리한다.
 * 설명: 사이드바 아이템과 아이콘 매핑을 제어 로직에서 분리해 앱 셸 책임을 줄인다.
 * 적용 패턴: 정적 구성 패턴
 * 참조: ui/src/widgets/app-shell-header.tsx, ui/src/widgets/app-shell/ui/sidebar-frame.tsx
 */
import type { LucideIcon } from "lucide-react";
import Bell from "lucide-react/dist/esm/icons/bell";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Code2 from "lucide-react/dist/esm/icons/code-2";
import FolderKanban from "lucide-react/dist/esm/icons/folder-kanban";
import House from "lucide-react/dist/esm/icons/house";
import MessageSquareText from "lucide-react/dist/esm/icons/message-square-text";
import NotebookPen from "lucide-react/dist/esm/icons/notebook-pen";
import TriangleAlert from "lucide-react/dist/esm/icons/triangle-alert";

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
