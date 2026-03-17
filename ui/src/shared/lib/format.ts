/**
 * 목적: 날짜와 숫자 포맷을 일관되게 처리한다.
 * 설명: 카드, 테이블, 상세 화면에서 반복되는 출력 규칙을 통일한다.
 * 적용 패턴: 표시 형식 유틸리티 패턴
 * 참조: ui/src/pages, ui/src/widgets
 */
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const compactNumberFormatter = new Intl.NumberFormat("ko-KR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatCompactNumber(value: number) {
  return compactNumberFormatter.format(value);
}
