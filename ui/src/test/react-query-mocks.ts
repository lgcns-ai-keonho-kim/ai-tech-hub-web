/**
 * 목적: React Query 훅 mock 결과를 타입 안전하게 캐스팅하는 공용 헬퍼를 제공한다.
 * 설명: 테스트에서 필요한 최소 필드만 작성하고도 개별 훅의 `ReturnType`으로 일관되게 변환할 수 있게 한다.
 * 적용 패턴: 테스트 어댑터 패턴
 * 참조: ui/src/test/setup.ts, @tanstack/react-query
 */
export function asQueryResult<TResult>(value: unknown) {
  return value as TResult;
}

export function asMutationResult<TResult>(value: unknown) {
  return value as TResult;
}
