<!--
목적: 루트 실행 방법과 현재 구현 범위를 빠르게 전달한다.
설명: 모노레포 구조, 주요 워크스페이스, 실행/테스트 명령을 한국어로 정리한다.
적용 패턴: 운영 문서 패턴
참조: PRODUCT.md, package.json, ui/, backend/
-->

# AI Agent Hub

로컬 프로토타이핑용 AI Agent Hub 모노레포입니다. 현재 구조는 `npm run dev` 기준으로 `ui`와 `backend`를 함께 올리고, Mock API + SQLite 기반 수직 슬라이스를 검증하는 데 초점을 맞춥니다.

## 워크스페이스

- `ui/`: Vite + React + TypeScript 기반 SPA
- `backend/`: Next.js App Router 기반 Mock API 서버
- `data/mock.db`: SQLite 개발 데이터 파일

## 현재 포함된 화면 / 기능

- 홈 카탈로그: 카테고리, 검색, 정렬, 카드 그리드
- 에이전트 상세: 요약, 지표, 마크다운 + Mermaid Overview
- 인증 모달: 이름 기반 Mock 로그인
- Lessons 목록 / 작성: 마크다운 편집 + 미리보기
- Admin 대시보드 / 에이전트 목록 / 신규 등록

## 설치 및 실행

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install
npm run dev
```

## 테스트 명령

테스트는 자동 실행하지 않았습니다. 아래 명령을 사용자가 직접 실행해 주세요.

```bash
npm run test --workspace ui
npm run test --workspace backend
```
