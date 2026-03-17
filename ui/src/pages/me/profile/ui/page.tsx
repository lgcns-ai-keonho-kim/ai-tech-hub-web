/**
 * 목적: 사용자 프로필과 비밀번호 변경 화면을 제공한다.
 * 설명: 이름, 이메일, 비밀번호를 분리된 폼으로 업데이트한다.
 * 적용 패턴: 설정 화면 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/store/use-auth-store.ts
 */
import { useState } from "react";

import { Button } from "@/shared/ui/primitives/button";
import {
  Field,
  FieldLabel,
} from "@/shared/ui/primitives/field";
import { Input } from "@/shared/ui/primitives/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import { useUpdatePasswordMutation, useUpdateProfileMutation } from "@/features/profile/model/mutations";
import { SectionHero } from "@/shared/ui/section-hero";
import { useAuthStore } from "@/entities/session/model/store";

export function MyProfilePage() {
  const session = useAuthStore((state) => state.session);
  const updateProfileMutation = useUpdateProfileMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();
  const [name, setName] = useState(session?.user.name ?? "");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="MyPage"
        title="프로필 관리"
        description="이름, 이메일, 비밀번호를 수정합니다. UI에는 닉네임 대신 이름으로 표시합니다."
      />

      <section className="page-stagger-group grid gap-6 xl:grid-cols-2">
        <Card className="surface-panel rounded-lg border-border bg-transparent">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="profile-name">이름</FieldLabel>
              <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className="h-9 rounded-md border-border bg-background" />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-email">이메일</FieldLabel>
              <Input id="profile-email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-9 rounded-md border-border bg-background" />
            </Field>
            <Button
              type="button"
              className="rounded-md"
              disabled={updateProfileMutation.isPending}
              onClick={() => updateProfileMutation.mutate({ name, email })}
            >
              {updateProfileMutation.isPending ? "저장 중..." : "기본 정보 저장"}
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-panel rounded-lg border-border bg-transparent">
          <CardHeader>
            <CardTitle>비밀번호 변경</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="current-password">현재 비밀번호</FieldLabel>
              <Input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="h-9 rounded-md border-border bg-background" />
            </Field>
            <Field>
              <FieldLabel htmlFor="next-password">새 비밀번호</FieldLabel>
              <Input id="next-password" type="password" value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} className="h-9 rounded-md border-border bg-background" />
            </Field>
            <Button
              type="button"
              className="rounded-md"
              disabled={updatePasswordMutation.isPending || nextPassword.trim().length < 6}
              onClick={async () => {
                await updatePasswordMutation.mutateAsync({ currentPassword, nextPassword });
                setCurrentPassword("");
                setNextPassword("");
              }}
            >
              {updatePasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
