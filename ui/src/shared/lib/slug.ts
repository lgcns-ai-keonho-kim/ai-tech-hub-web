/**
 * 목적: 관리자 폼에서 사용할 slug 생성 규칙을 제공한다.
 * 설명: 영문 소문자, 숫자, 하이픈만 남기는 최소 규칙으로 URL 호환 식별자를 만든다.
 * 적용 패턴: 문자열 정규화 패턴
 * 참조: ui/src/pages/admin-new-agent-page.tsx
 */
export function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
