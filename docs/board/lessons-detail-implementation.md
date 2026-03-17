## 게시판 상세 구현 요약

### 변경 목적

- 게시판 목록에서 게시글을 클릭했을 때 상세 화면으로 이동할 수 있게 한다.
- 게시글 유형별 시드 데이터를 늘려 목록 필터가 실제처럼 보이게 한다.
- 상세 화면에서 마크다운 본문과 Mermaid를 그대로 확인할 수 있게 한다.

### 구현 범위

- `backend/src/app/api/lessons/[id]/route.ts`
  - 게시글 단건 조회 API 추가
- `backend/src/db/repositories.ts`
  - 게시글 상세 조회 저장소 함수 추가
- `ui/src/pages/lesson-detail-page.tsx`
  - 게시글 상세 화면 추가
- `ui/src/app/router.tsx`
  - `/lessons/:id` 라우트 연결
- `ui/src/pages/lessons-page.tsx`
  - 모바일 카드와 데스크톱 제목에 상세 진입 링크 연결
- `backend/src/db/seed-data.ts`
  - 카테고리별 게시글 시드 확장

### 현재 기대 동작

1. 게시판 목록에서 게시글 제목 또는 카드 클릭
2. `/lessons/:id` 상세 화면으로 이동
3. 게시글 유형, 작성자, 작성일, 대상 에이전트와 본문 마크다운 확인

### 의도적으로 미루는 것

- 게시글 수정/삭제
- 이전글/다음글 탐색
- 댓글, 첨부파일, 검색 하이라이트
