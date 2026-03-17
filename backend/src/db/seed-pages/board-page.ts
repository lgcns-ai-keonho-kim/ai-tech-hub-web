/**
 * 목적: 게시판 페이지용 시드를 정의한다.
 * 설명: 공지사항과 Q&A 탭에서 목록, 댓글, 알림 연계를 확인할 수 있는 게시글 예시를 제공한다.
 * 적용 패턴: 페이지 시드 모듈 패턴
 * 참조: backend/src/db/seed-pages/shared.ts
 */
import { iso } from "@/db/seed-pages/shared";
import type { SeedBundle } from "@/db/seed-pages/types";

export const boardPageSeed: SeedBundle = {
  boardPosts: [
    { id: 1, type: "notice", authorUserId: 1, title: "자산 등록 정책 안내", content: "# 자산 등록 정책\n\n프로젝트 연결 자산은 매니저 승인 후 공개됩니다.", createdAt: iso(10, 8), updatedAt: iso(10, 8) },
    { id: 2, type: "notice", authorUserId: 1, title: "Kubernetes 문서 업로드 가이드", content: "# Kubernetes 문서 업로드 가이드\n\n제안서, 설계서, 종료보고서를 프로젝트별로 분리해 등록해 주세요.", createdAt: iso(11, 8), updatedAt: iso(11, 8) },
    { id: 3, type: "notice", authorUserId: 1, title: "프로젝트 승인 대기 처리 기준", content: "# 프로젝트 승인 대기 처리 기준\n\n요약, 본문, 프로젝트 연결 여부, 첨부 링크를 기준으로 검토합니다.", createdAt: iso(12, 8), updatedAt: iso(12, 8) },
    { id: 4, type: "qna", authorUserId: 3, title: "RAG 프로젝트 회고 템플릿이 있나요?", content: "프로젝트별 Lesson & Learned 템플릿 추천 부탁드립니다.", createdAt: iso(10, 12), updatedAt: iso(10, 12) },
    { id: 5, type: "qna", authorUserId: 6, title: "통합 테스트 결과보고서에 포함해야 할 최소 항목은 무엇인가요?", content: "환경 정보, 시나리오, 실패 로그 외에 운영 전환을 위해 꼭 필요한 항목이 궁금합니다.", createdAt: iso(11, 12), updatedAt: iso(11, 12) },
    { id: 6, type: "qna", authorUserId: 7, title: "Kubernetes 종료보고서에 운영 지표를 어디까지 넣는 게 적절할까요?", content: "배포 속도, 장애 복구 시간, 비용 변화 중 우선순위가 궁금합니다.", createdAt: iso(12, 12), updatedAt: iso(12, 12) },
    { id: 7, type: "qna", authorUserId: 3, title: "개발자 포털 권한 모델 문서는 어떤 수준까지 상세히 써야 하나요?", content: "관리자, 매니저, 사용자 외 예외 케이스도 문서에 포함해야 할지 고민입니다.", createdAt: iso(13, 12), updatedAt: iso(13, 12) },
    { id: 8, type: "qna", authorUserId: 6, title: "장애 대응 대시보드 테스트는 어떤 지표를 우선 봐야 하나요?", content: "지연, 누락, 중복 알림 중 어떤 항목을 통합 테스트의 핵심 기준으로 잡아야 할지 궁금합니다.", createdAt: iso(14, 12), updatedAt: iso(14, 12) },
  ],
  boardComments: [
    { id: 1, postId: 4, userId: 2, content: "회고는 문제, 배운 점, 다음 액션 세 섹션으로 나누면 좋습니다.", createdAt: iso(10, 12, 30), updatedAt: iso(10, 12, 30) },
    { id: 2, postId: 5, userId: 5, content: "환경 버전, 외부 연동 상태, 장애 대응 기준 시간을 꼭 포함하는 쪽을 추천합니다.", createdAt: iso(11, 12, 20), updatedAt: iso(11, 12, 20) },
    { id: 3, postId: 6, userId: 7, content: "배포 속도와 장애 복구 시간을 기본으로 두고 비용 지표는 보조로 넣는 편이 좋습니다.", createdAt: iso(12, 12, 25), updatedAt: iso(12, 12, 25) },
    { id: 4, postId: 7, userId: 2, content: "예외 케이스는 표로 묶고 본문에는 기본 권한 흐름을 먼저 쓰는 구성이 읽기 좋습니다.", createdAt: iso(13, 12, 20), updatedAt: iso(13, 12, 20) },
    { id: 5, postId: 8, userId: 7, content: "이벤트 누락률과 중복 알림률을 핵심 지표로 두고 지연은 보조 지표로 두는 편이 좋습니다.", createdAt: iso(14, 12, 20), updatedAt: iso(14, 12, 20) },
  ],
};
