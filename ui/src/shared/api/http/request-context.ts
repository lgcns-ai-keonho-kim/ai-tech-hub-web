/**
 * 목적: HTTP 요청에 필요한 동적 헤더 공급자를 등록한다.
 * 설명: shared 레이어가 상위 세션 저장소를 직접 참조하지 않도록 요청 컨텍스트를 간접 주입한다.
 * 적용 패턴: 의존성 주입 패턴
 * 참조: ui/src/shared/api/http/client.ts, ui/src/app/providers.tsx
 */
export type RequestHeadersResolver = () => Record<string, string>;

let headersResolver: RequestHeadersResolver | null = null;

export function registerRequestHeadersResolver(resolver: RequestHeadersResolver) {
  headersResolver = resolver;
}

export function resolveRequestHeaders() {
  return headersResolver?.() ?? {};
}
