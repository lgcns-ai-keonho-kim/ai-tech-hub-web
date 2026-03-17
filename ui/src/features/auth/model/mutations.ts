/**
 * 목적: 인증 피처가 소유하는 변경 훅을 제공한다.
 * 설명: 로그인과 회원가입 흐름에서 세션 저장, 인증성 캐시 준비, 토스트 메시지 책임을 인증 피처에 모은다.
 * 적용 패턴: Mutation 캡슐화 패턴
 * 참조: ui/src/features/auth/model/types.ts, ui/src/entities/notification/model/queries.ts
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createNotificationsQueryOptions } from "@/entities/notification/model/queries";
import {
  createProjectApprovalsQueryOptions,
  serializeManagedProjectIds,
} from "@/entities/project/model/queries";
import { postRequest } from "@/shared/api/http/client";
import { useSessionStore } from "@/entities/session/model/store";
import type { UserSession } from "@/entities/session/model/types";
import type { LoginInput, SignupInput } from "@/features/auth/model/types";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (input: LoginInput) =>
      postRequest<{ session: UserSession }, LoginInput>("/auth/login", input),
    onSuccess: async ({ session }) => {
      setSession(session);
      await queryClient.prefetchQuery(createNotificationsQueryOptions(session.user.id));
      if (session.managedProjectIds.length > 0) {
        const managedProjectIdsKey = serializeManagedProjectIds(session.managedProjectIds);
        await queryClient.prefetchQuery(
          createProjectApprovalsQueryOptions(session.user.id, managedProjectIdsKey),
        );
      }
      toast.success("로그인되었습니다.");
    },
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: (input: SignupInput) =>
      postRequest<{ pending: boolean; message: string }, SignupInput>("/auth/signup", input),
    onSuccess: ({ message }) => {
      toast.success(message);
    },
  });
}
