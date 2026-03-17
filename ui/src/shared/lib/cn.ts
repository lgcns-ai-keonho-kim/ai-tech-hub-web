/**
 * 목적: 클래스 병합 유틸리티를 FSD 공용 레이어에서 제공한다.
 * 설명: clsx와 tailwind-merge를 조합해 컴포넌트 className 구성을 일관되게 유지한다.
 * 적용 패턴: 파사드 패턴
 * 참조: ui/src/shared/ui/primitives, ui/src/shared/ui
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
