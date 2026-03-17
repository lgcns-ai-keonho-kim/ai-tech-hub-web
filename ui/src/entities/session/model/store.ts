/**
 * 목적: 로그인 세션을 전역 상태로 저장한다.
 * 설명: persist 저장소와 selector-friendly 구조를 통해 인증 관련 UI가 최소 범위만 구독하게 한다.
 * 적용 패턴: Zustand 저장소 패턴
 * 참조: ui/src/entities/session/model/types.ts, ui/src/entities/session/lib/request-headers.ts
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserSession } from "@/entities/session/model/types";

type SessionState = {
  session: UserSession | null;
  setSession: (session: UserSession) => void;
  clearSession: () => void;
};

export const useAuthStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: "asset-tech-hub-auth",
    },
  ),
);

export const useSessionStore = useAuthStore;
