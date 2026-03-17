/**
 * 목적: 브라우저 DOM에 React 애플리케이션을 마운트한다.
 * 설명: 전역 스타일을 로드한 뒤 최상위 앱을 렌더링한다.
 * 적용 패턴: 부트스트랩 패턴
 * 참조: ui/src/App.tsx, ui/src/index.css
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/App";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
