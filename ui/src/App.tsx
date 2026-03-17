/**
 * 목적: UI 애플리케이션의 최상위 진입 컴포넌트를 제공한다.
 * 설명: 전역 Provider와 라우터를 연결해 모든 페이지가 동일한 실행 문맥을 공유하게 한다.
 * 적용 패턴: 앱 셸 패턴
 * 참조: ui/src/app/providers.tsx, ui/src/app/router.tsx
 */
import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/router";

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
