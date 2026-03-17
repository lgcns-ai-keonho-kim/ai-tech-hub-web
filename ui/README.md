<!--
목적: ui 워크스페이스의 역할, 주요 기술 선택, 빌드 시 유의사항을 정리한다.
설명: 화면 구조, 상태 관리, mixed chart 구현 원칙, 테스트 명령을 한국어로 안내한다.
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
- Chart.js

## 차트 구현 원칙

현재 `ui`에는 프로젝트 단계 현황을 보여주는 **혼합 차트(mixed chart)** 가 있습니다.  
이 차트는 bar dataset과 line dataset을 함께 사용합니다.

### 왜 `react-chartjs-2` wrapper를 쓰지 않았는가

초기에는 `react-chartjs-2`의 `<Chart />` wrapper를 사용했지만, mixed chart를 엄격 타입으로 표현하는 과정에서 다음 문제가 반복되었습니다.

- Chart.js 공식 mixed chart는 dataset별 `type`을 허용함
- `react-chartjs-2`의 일반 `ChartProps<TType>`는 단일 `TType` 중심
- 결과적으로 `ChartData<"bar" | "line">`, `ChartOptions<"bar">`, scriptable context 타입이 서로 충돌함
- Docker 빌드처럼 `tsc -b`를 먼저 돌리는 경로에서 이 문제가 바로 표면화됨

즉, 이 문제는 단순한 캐스팅 이슈가 아니라 **wrapper 타입 모델과 mixed chart 공식 모델이 서로 다르기 때문**입니다.

### 현재 선택한 방식

그래서 지금은 mixed chart 경로만 다음 방식으로 구현합니다.

- 부모 패널이 공식 Chart.js mixed chart config를 생성
- lazy-loaded 차트 컴포넌트가 `canvas` ref를 통해 Chart.js 인스턴스를 직접 생성
- theme 변경이나 config 변경 시 기존 인스턴스를 `destroy()` 후 재생성

이 방식의 장점:

- 공식 Chart.js 타입 계약에 직접 맞출 수 있음
- `react-chartjs-2` wrapper 제네릭에 종속되지 않음
- 의존성 업데이트 때 같은 타입 충돌이 다시 생길 가능성이 낮음

### 추후 작업 시 주의

이 차트를 수정할 때는 다음 원칙을 유지하는 것이 좋습니다.

- mixed chart는 wrapper 우회 캐스팅보다 **공식 Chart.js config 타입**을 우선할 것
- `bar`와 `line` dataset을 합친 경우, 차트 config는 dataset별 타입을 유지할 것
- mount/unmount 때 Chart.js 인스턴스 정리를 빼먹지 말 것

즉, 지금의 direct Chart.js 방식은 임시 해킹이 아니라 **본서비스까지 고려한 유지보수 비용 절감 전략**입니다.

## 테스트

```bash
npm run test --workspace ui
```
