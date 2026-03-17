/**
 * 목적: 프로필 피처가 소유하는 변경 훅을 제공한다.
 * 설명: 내 정보와 비밀번호 변경 흐름에서 세션 갱신과 오류 복구 책임을 프로필 피처에 둔다.
 * 적용 패턴: Mutation 캡슐화 패턴
 * 참조: ui/src/entities/user/model/types.ts, ui/src/entities/session/model/store.ts
 */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { patchRequest } from "@/shared/api/http/client";
import { useSessionStore } from "@/entities/session/model/store";
import type { UserSession } from "@/entities/session/model/types";
import type {
  UpdatePasswordInput,
  UpdateProfileInput,
} from "@/entities/user/model/types";

export function useUpdateProfileMutation() {
  const setSession = useSessionStore((state) => state.setSession);
  const currentSession = useSessionStore((state) => state.session);

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      patchRequest<{ session: UserSession }, UpdateProfileInput>("/users/me/profile", input),
    onSuccess: ({ session }) => {
      setSession(session);
      toast.success("프로필이 업데이트되었습니다.");
    },
    onError: () => {
      if (currentSession) {
        setSession(currentSession);
      }
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (input: UpdatePasswordInput) =>
      patchRequest<{ updated: boolean }, UpdatePasswordInput>("/users/me/password", input),
    onSuccess: () => {
      toast.success("비밀번호가 변경되었습니다.");
    },
  });
}
