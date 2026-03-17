/**
 * 목적: Query, Theme, Toast 같은 전역 Provider를 한 곳에 묶는다.
 * 설명: 페이지 전체가 동일한 서버 상태 캐시, 사용자 선택 테마, 요청 헤더 정책을 공유하도록 구성한다.
 * 적용 패턴: Provider 조합 패턴
 * 참조: ui/src/App.tsx, ui/src/shared/api/http/request-context.ts
 */
import { type ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { toSessionRequestHeaders } from "@/entities/session/lib/request-headers";
import { useAuthStore } from "@/entities/session/model/store";
import { registerRequestHeadersResolver } from "@/shared/api/http/request-context";
import { Toaster } from "@/shared/ui/primitives/sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

registerRequestHeadersResolver(() => {
  const session = useAuthStore.getState().session;
  return toSessionRequestHeaders(session);
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
