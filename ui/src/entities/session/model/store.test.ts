/**
 * 목적: 인증 스토어의 세션 저장과 초기화 동작을 검증한다.
 * 설명: localStorage persist가 켜진 상태에서도 기본 상태 변경이 안정적으로 동작하는지 확인한다.
 * 적용 패턴: 상태 저장소 테스트 패턴
 * 참조: ui/src/store/use-auth-store.ts
 */
import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/entities/session/model/store";

describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ session: null });
  });

  it("세션을 저장할 수 있다", () => {
    useAuthStore.getState().setSession({
      user: {
        id: 1,
        email: "user@mock.local",
        name: "김하늘",
        accountStatus: "approved",
        globalRole: "user",
      },
      managedProjectIds: [],
    });

    expect(useAuthStore.getState().session?.user.name).toBe("김하늘");
  });

  it("세션을 초기화할 수 있다", () => {
    useAuthStore.getState().setSession({
      user: {
        id: 1,
        email: "user@mock.local",
        name: "김하늘",
        accountStatus: "approved",
        globalRole: "user",
      },
      managedProjectIds: [],
    });

    useAuthStore.getState().clearSession();

    expect(useAuthStore.getState().session).toBeNull();
  });
});
