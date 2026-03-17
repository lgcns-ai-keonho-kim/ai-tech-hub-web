/**
 * 목적: 내 자산, 즐겨찾기, 알림 페이지용 시드를 정의한다.
 * 설명: 좋아요, 즐겨찾기, 다운로드, 댓글, 알림처럼 사용자 상호작용 중심의 데이터를 제공한다.
 * 적용 패턴: 페이지 시드 모듈 패턴
 * 참조: backend/src/db/seed-pages/shared.ts, backend/src/db/seed-pages/board-page.ts
 */
import { iso } from "@/db/seed-pages/shared";
import type { SeedBundle } from "@/db/seed-pages/types";

export const engagementPageSeed: SeedBundle = {
  assetPreferences: [
    { id: 1, assetId: 1, userId: 3, liked: 1, favorited: 1, updatedAt: iso(16, 9) },
    { id: 2, assetId: 9, userId: 3, liked: 1, favorited: 1, updatedAt: iso(16, 9, 10) },
    { id: 3, assetId: 12, userId: 6, liked: 1, favorited: 0, updatedAt: iso(16, 9, 20) },
    { id: 4, assetId: 118, userId: 2, liked: 1, favorited: 0, updatedAt: iso(16, 9, 30) },
    { id: 5, assetId: 125, userId: 5, liked: 1, favorited: 1, updatedAt: iso(16, 9, 40) },
    { id: 6, assetId: 203, userId: 3, liked: 1, favorited: 0, updatedAt: iso(16, 9, 50) },
    { id: 7, assetId: 303, userId: 2, liked: 1, favorited: 0, updatedAt: iso(16, 10) },
    { id: 8, assetId: 141, userId: 6, liked: 1, favorited: 1, updatedAt: iso(16, 10, 10) },
  ],
  assetDownloads: [
    { id: 1, assetId: 1, userId: 3, createdAt: iso(16, 10, 20) },
    { id: 2, assetId: 2, userId: 3, createdAt: iso(16, 10, 25) },
    { id: 3, assetId: 6, userId: 3, createdAt: iso(16, 10, 30) },
    { id: 4, assetId: 115, userId: 3, createdAt: iso(16, 10, 35) },
    { id: 5, assetId: 126, userId: 6, createdAt: iso(16, 10, 40) },
    { id: 6, assetId: 132, userId: 7, createdAt: iso(16, 10, 45) },
    { id: 7, assetId: 137, userId: 3, createdAt: iso(16, 10, 50) },
    { id: 8, assetId: 142, userId: 6, createdAt: iso(16, 10, 55) },
  ],
  assetComments: [
    { id: 1, assetId: 101, userId: 2, content: "업무 범위와 승인 주체를 한 줄 더 명확히 적어두면 후속 검토가 쉬워집니다.", createdAt: iso(16, 11), updatedAt: iso(16, 11) },
    { id: 2, assetId: 111, userId: 3, content: "네임스페이스 전략이 명확해서 운영 문서 템플릿으로 바로 써도 될 것 같습니다.", createdAt: iso(16, 11, 10), updatedAt: iso(16, 11, 10) },
    { id: 3, assetId: 204, userId: 2, content: "재현 단계에 사용한 이미지 태그와 패키지 버전까지 넣어주면 승인 검토가 더 빨라집니다.", createdAt: iso(16, 11, 20), updatedAt: iso(16, 11, 20) },
    { id: 4, assetId: 305, userId: 5, content: "베타 피드백은 긍정/부정/보완 요청으로 나눠 적으면 다음 회고와 연결하기 좋습니다.", createdAt: iso(16, 11, 30), updatedAt: iso(16, 11, 30) },
    { id: 5, assetId: 308, userId: 7, content: "중복 알림률과 누락 이벤트율을 따로 써두면 운영팀 설득에 도움이 됩니다.", createdAt: iso(16, 11, 40), updatedAt: iso(16, 11, 40) },
  ],
  notifications: [
    { id: 1, userId: 3, type: "asset-approved", targetType: "asset", targetId: 101, message: "MCP 요구사항 정의서 자산이 승인되었습니다.", readAt: null, createdAt: iso(1, 13, 20) },
    { id: 2, userId: 6, type: "asset-comment", targetType: "asset", targetId: 204, message: "Airflow DAG 배포 실패 이슈 자산에 새 댓글이 등록되었습니다.", readAt: null, createdAt: iso(16, 11, 20) },
    { id: 3, userId: 6, type: "asset-comment", targetType: "asset", targetId: 305, message: "고객 상담 Copilot 베타 회고 자산에 새 댓글이 등록되었습니다.", readAt: null, createdAt: iso(16, 11, 30) },
    { id: 4, userId: 7, type: "asset-comment", targetType: "asset", targetId: 308, message: "장애 대응 대시보드 회고 자산에 새 댓글이 등록되었습니다.", readAt: null, createdAt: iso(16, 11, 40) },
    { id: 5, userId: 3, type: "qna-comment", targetType: "board", targetId: 4, message: "Q&A 게시글에 새 댓글이 등록되었습니다.", readAt: null, createdAt: iso(10, 12, 30) },
    { id: 6, userId: 6, type: "qna-comment", targetType: "board", targetId: 5, message: "Q&A 게시글에 새 댓글이 등록되었습니다.", readAt: null, createdAt: iso(11, 12, 20) },
    { id: 7, userId: 7, type: "qna-comment", targetType: "board", targetId: 6, message: "Q&A 게시글에 새 댓글이 등록되었습니다.", readAt: null, createdAt: iso(12, 12, 25) },
  ],
};
