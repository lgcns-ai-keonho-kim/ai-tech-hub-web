/**
 * 목적: 자산/게시판 관련 표시 상수를 제공한다.
 * 설명: 목록, 상세, 필터, 네비게이션이 동일한 라벨과 경로 규칙을 공유하게 한다.
 * 적용 패턴: 정적 구성 패턴
 * 참조: ui/src/pages, ui/src/widgets/app-shell
 */
import type {
  AssetKind,
  AssetSort,
  AssetStatus,
  AssetViewMode,
} from "@/entities/asset/model/types";
import type { BoardType } from "@/entities/board/model/types";

export const assetKindOptions: Array<{
  value: AssetKind;
  label: string;
  path: string;
}> = [
  { value: "code", label: "코드 자산", path: "/code-assets" },
  { value: "knowledge", label: "지식 자산", path: "/knowledge-assets" },
  { value: "troubleshooting", label: "트러블슈팅", path: "/troubleshooting" },
  { value: "lesson", label: "Lesson & Learned", path: "/lessons" },
];

export const assetSortOptions: Array<{ value: AssetSort; label: string }> = [
  { value: "latest", label: "최신순" },
  { value: "rating", label: "평점순" },
  { value: "downloads", label: "다운로드순" },
];

export const assetViewModeOptions: Array<{ value: AssetViewMode; label: string }> = [
  { value: "card", label: "카드형" },
  { value: "list", label: "목록형" },
];

export function getAssetKindLabel(kind: AssetKind) {
  return assetKindOptions.find((option) => option.value === kind)?.label ?? kind;
}

export function getAssetPath(kind: AssetKind) {
  return assetKindOptions.find((option) => option.value === kind)?.path ?? "/";
}

export function getAssetStatusLabel(status: AssetStatus) {
  switch (status) {
    case "pending":
      return "승인 대기";
    case "approved":
      return "공개";
    case "rejected":
      return "거절";
  }
}

export function getBoardTypeLabel(type: BoardType) {
  switch (type) {
    case "notice":
      return "공지사항";
    case "qna":
      return "Q&A";
  }
}
