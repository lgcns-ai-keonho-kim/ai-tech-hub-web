/**
 * 목적: 로그인과 회원가입을 한 화면에서 제공한다.
 * 설명: 승인형 Mock 인증 흐름에 맞춰 로그인/회원가입 폼과 대기 상태 안내를 렌더링한다.
 * 적용 패턴: 인증 진입 화면 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/store/use-auth-store.ts
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/ui/primitives/alert";
import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/primitives/field";
import { Input } from "@/shared/ui/primitives/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/primitives/tabs";
import { useLoginMutation, useSignupMutation } from "@/features/auth/model/mutations";
import { BrandMark } from "@/shared/ui/brand-mark";
import { useAuthStore } from "@/entities/session/model/store";
import { ThemeToggle } from "@/widgets/theme-toggle";

const loginSchema = z.object({
  email: z.string().trim().email("올바른 이메일을 입력해 주세요."),
  password: z.string().trim().min(6, "비밀번호는 6자 이상이어야 합니다."),
});

const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, "이름은 2자 이상이어야 합니다."),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const [tab, setTab] = useState<"login" | "signup">("login");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (session?.user.accountStatus === "approved") {
      navigate("/", { replace: true });
    }
  }, [navigate, session]);

  const authError = loginMutation.error ?? signupMutation.error;

  return (
    <div className="page-transition page-stagger ambient-root flex min-h-screen items-center justify-center px-4 py-10">
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4">
        <Card className="surface-panel rounded-lg bg-transparent">
          <CardHeader className="items-center pb-2">
            <div className="flex w-full justify-end">
              <ThemeToggle className="rounded-md" />
            </div>
            <div className="flex justify-center py-5">
              <BrandMark variant="lockup" />
            </div>
            <CardTitle className="text-center text-lg">계속하려면 로그인하세요.</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "signup")}>
              <TabsList variant="line" className="w-full p-1">
                <TabsTrigger value="login">로그인</TabsTrigger>
                <TabsTrigger value="signup">회원가입</TabsTrigger>
              </TabsList>
            </Tabs>

            {authError ? (
              <Alert className="status-panel border-destructive/40">
                <AlertTitle>인증 실패</AlertTitle>
                <AlertDescription>{authError.message}</AlertDescription>
              </Alert>
            ) : null}

            {tab === "login" ? (
              <form
                className="flex flex-col gap-4"
                onSubmit={loginForm.handleSubmit(async (values) => {
                  await loginMutation.mutateAsync(values);
                })}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="login-email">이메일</FieldLabel>
                    <Input id="login-email" {...loginForm.register("email")} />
                    <FieldError>{loginForm.formState.errors.email?.message}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="login-password">비밀번호</FieldLabel>
                    <Input id="login-password" type="password" {...loginForm.register("password")} />
                    <FieldError>{loginForm.formState.errors.password?.message}</FieldError>
                  </Field>
                </FieldGroup>
                <Button type="submit" className="w-full rounded-md" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            ) : (
              <form
                className="flex flex-col gap-4"
                onSubmit={signupForm.handleSubmit(async (values) => {
                  await signupMutation.mutateAsync(values);
                  signupForm.reset();
                  setTab("login");
                })}
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="signup-name">이름</FieldLabel>
                    <Input id="signup-name" {...signupForm.register("name")} />
                    <FieldError>{signupForm.formState.errors.name?.message}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="signup-email">이메일</FieldLabel>
                    <Input id="signup-email" {...signupForm.register("email")} />
                    <FieldError>{signupForm.formState.errors.email?.message}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="signup-password">비밀번호</FieldLabel>
                    <Input
                      id="signup-password"
                      type="password"
                      {...signupForm.register("password")}
                    />
                    <FieldError>{signupForm.formState.errors.password?.message}</FieldError>
                  </Field>
                </FieldGroup>
                <Alert className="border-border bg-muted/50">
                  <AlertTitle>가입 승인 필요</AlertTitle>
                  <AlertDescription>
                    회원가입 후 관리자의 승인 전까지는 로그인할 수 없습니다.
                  </AlertDescription>
                </Alert>
                <Button type="submit" className="w-full rounded-md" disabled={signupMutation.isPending}>
                  {signupMutation.isPending ? "가입 요청 중..." : "회원가입 요청"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
