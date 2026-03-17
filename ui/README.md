<!--
목적: ui 워크스페이스의 역할과 실행 방식을 간단히 정리한다.
설명: 화면 구조, 주요 기술 스택, 테스트 명령을 한국어로 안내한다.
적용 패턴: 워크스페이스 문서 패턴
참조: ui/src, ../README.md
-->

# UI Workspace

`ui/`는 Vite + React + TypeScript 기반의 AI Agent Hub SPA입니다.

## 포함 범위

- 홈 카탈로그
- 에이전트 상세
- Lessons 목록 / 작성
- Admin 대시보드 / 목록 / 신규 등록

## 주요 기술

- React Router
- TanStack Query
- Zustand
- Tailwind CSS v4
- Shadcn UI

## 테스트

```bash
npm run test --workspace ui
```
