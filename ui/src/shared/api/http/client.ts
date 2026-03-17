/**
 * 목적: UI 전역에서 사용하는 axios HTTP 클라이언트를 제공한다.
 * 설명: 공통 baseURL, 인증 헤더 주입, 오류 정규화, response.data 추출 규칙을 한 곳에 모은다.
 * 적용 패턴: API 클라이언트 패턴
 * 참조: ui/src/shared/api/http/request-context.ts, ui/src/shared/api/http/error.ts
 */
import axios, { AxiosHeaders, type AxiosRequestConfig } from "axios";

import { toApiClientError } from "@/shared/api/http/error";
import { resolveRequestHeaders } from "@/shared/api/http/request-context";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const requestHeaders = resolveRequestHeaders();
  const mergedHeaders = AxiosHeaders.from({
    ...requestHeaders,
    ...(config.headers ?? {}),
  });

  return {
    ...config,
    headers: mergedHeaders,
  };
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiClientError(error)),
);

export async function getRequest<T>(url: string, config?: AxiosRequestConfig) {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function postRequest<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig<TBody>,
) {
  const response = await apiClient.post<TResponse>(url, body, config);
  return response.data;
}

export async function patchRequest<TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig<TBody>,
) {
  const response = await apiClient.patch<TResponse>(url, body, config);
  return response.data;
}

export async function deleteRequest<TResponse, TBody = unknown>(
  url: string,
  config?: AxiosRequestConfig<TBody>,
) {
  const response = await apiClient.delete<TResponse>(url, config);
  return response.data;
}
