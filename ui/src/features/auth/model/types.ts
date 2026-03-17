/**
 * 목적: 인증 피처가 소유하는 입력 타입을 정의한다.
 * 설명: 로그인과 회원가입 흐름이 화면 계층과 분리된 입력 계약을 공유하게 한다.
 * 적용 패턴: 타입 계약 패턴
 * 참조: ui/src/features/auth/model/mutations.ts
 */
export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  email: string;
  password: string;
  name: string;
};
