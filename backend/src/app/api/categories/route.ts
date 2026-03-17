/**
 * 목적: 레거시 카테고리 경로를 새 자산 카테고리 구조에 연결한다.
 * 설명: 기존 `/api/categories` 호출도 같은 자산 카테고리 목록을 반환하게 유지한다.
 * 적용 패턴: 호환 엔드포인트 패턴
 * 참조: backend/src/app/api/asset-categories/route.ts
 */
export { GET } from "@/app/api/asset-categories/route";
