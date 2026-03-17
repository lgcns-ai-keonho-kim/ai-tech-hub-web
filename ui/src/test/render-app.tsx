/**
 * 목적: 페이지/위젯 테스트에서 공통 라우터 컨텍스트를 일관되게 제공한다.
 * 설명: Router, QueryClient, ThemeProvider를 공통으로 묶어 페이지 테스트 구성을 단순화한다.
 * 적용 패턴: 테스트 하네스 패턴
 * 참조: ui/src/test/setup.ts, react-router-dom
 */
import { useState, type PropsWithChildren, type ReactElement } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { MemoryRouter } from "react-router-dom";

type RenderWithAppProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  initialEntries?: string[];
};

function AppTestProviders({
  children,
  initialEntries,
}: PropsWithChildren<{ initialEntries?: string[] }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export function renderWithAppProviders(
  ui: ReactElement,
  { initialEntries = ["/"], ...options }: RenderWithAppProvidersOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AppTestProviders initialEntries={initialEntries}>
        {children}
      </AppTestProviders>
    ),
    ...options,
  });
}
