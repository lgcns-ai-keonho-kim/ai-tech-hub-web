/**
 * 목적: 서버 오류를 UI에서 다루기 쉬운 형태로 정규화한다.
 * 설명: axios 오류를 상태 코드, 서버 코드, 사용자 메시지를 포함하는 도메인 오류로 변환한다.
 * 적용 패턴: 오류 어댑터 패턴
 * 참조: ui/src/shared/api/http/client.ts
 */
import axios from "axios";

type ApiErrorPayload = {
  message?: string;
  code?: string;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

export function toApiClientError(error: unknown) {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    return new ApiClientError("요청 처리 중 알 수 없는 오류가 발생했습니다.", 500);
  }

  const payload = error.response?.data as ApiErrorPayload | undefined;
  return new ApiClientError(
    payload?.message ?? "요청 처리에 실패했습니다.",
    error.response?.status ?? 500,
    payload?.code,
  );
}
