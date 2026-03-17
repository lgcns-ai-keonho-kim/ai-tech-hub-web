/**
 * 목적: Next.js App Router의 루트 레이아웃을 제공한다.
 * 설명: API 전용 워크스페이스라도 최소 문서 뼈대를 두어 개발 서버 진입 시 오류를 피한다.
 * 적용 패턴: 루트 레이아웃 패턴
 * 참조: backend/src/app/page.tsx
 */
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
