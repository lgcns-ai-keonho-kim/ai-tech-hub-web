# AI Agent Hub 통합 기술 설계서 (Product Technical Design Document)

## 1. 제품 개요 (Product Overview)

본 프로젝트는 다양한 AI 에이전트와 모델(Multi-Agent, CLI Tools, Code Generation 등)을 탐색, 다운로드, 테스트할 수 있는 중앙 집중형 **AI Agent Hub**입니다. NVIDIA Blueprints와 유사한 탐색 경험을 제공합니다.

초기 개발 및 로컬 테스트의 편의성을 위해 모든 외부 종속성을 최소화하며, **Mock API**와 **SQLite**를 기반으로 작동하여 즉각적인 프로토타이핑이 가능하도록 설계되었습니다. Product-Ready 수준의 아키텍처를 지향하여 향후 실제 DB 및 Auth 시스템으로의 전환이 용이하도록 구성합니다.

## 2. 디자인 시스템 기조 (Design Philosophy & Theme)

본 프로젝트의 UI는 **shadcn/ui 기반 Neutral Minimal 시스템**을 기준으로 설계합니다. 색상 효과보다 **여백, 경계선, 정보 밀도**로 계층을 표현하고, 라이트와 다크 모두 같은 구조와 상호작용 품질을 유지합니다.

### 2.1 핵심 디자인 키워드

* **Neutral Minimal**: 강한 장식 대신 흰 배경, 중립 표면, 1px 경계선으로 화면을 구성합니다.
* **Border-Led Hierarchy**: 섹션 구분은 배경색 남용이 아니라 divider와 gap으로 해결합니다.
* **Black CTA Only**: 핵심 액션은 검정 CTA만 사용하고, destructive만 red 계열을 허용합니다.
* **Compact Productivity**: 리스트, 테이블, 설정 화면은 짧은 높이와 촘촘한 간격으로 빠르게 읽히게 만듭니다.
* **Accessible Motion**: 전환은 `150ms ease-out` 이내로 제한하고 장식적 애니메이션은 사용하지 않습니다.

### 2.2 색상 시스템

* **라이트 테마**
* 배경: `#FFFFFF`
* 표면: `zinc-50`
* 보조 표면: `zinc-100`
* 기본 텍스트: `zinc-900`
* 보조 텍스트: `zinc-500`
* placeholder: `zinc-400`
* 기본 경계선: `zinc-200`
* hover 경계선: `zinc-300`
* focus 링: `zinc-900`
* **다크 테마**
* 배경: `zinc-950`
* 표면: `zinc-900`
* 보조 표면: `zinc-800`
* 기본 텍스트: `zinc-50`
* 보조 텍스트: `zinc-400`
* 기본 경계선: `zinc-800`
* hover 경계선: `zinc-700`
* focus 링: `zinc-50`

### 2.3 타이포그래피와 컴포넌트 규격

* 폰트는 `system-ui, sans-serif`만 사용합니다. 별도 웹폰트는 금지합니다.
* 텍스트 스케일은 `12px`, `13px`, `14px`, `16px`, `18px`, `20px`만 사용합니다.
* 기본 굵기는 `400`, `500`만 사용합니다.
* Input 높이는 `36px`, Button 높이는 기본 `36px`, small `32px`, large `40px`입니다.
* 기본 radius는 `6px`, 카드 radius는 `8px`입니다.
* 일반 카드에는 그림자를 두지 않고, Dropdown·Popover만 `shadow-sm`를 허용합니다.

### 2.4 금지 사항

* 그라디언트 배경
* 장식용 `drop-shadow`
* 복수의 강조색
* `2px` 초과 border
* 배경색 위주의 섹션 구분
* 컴포넌트 내부 색상 하드코딩
* 별도 웹폰트 로드

## 3. 시스템 아키텍처 및 기술 스택

안정적이고 대규모 확장이 가능한 최신 오픈소스 생태계를 활용하며, `npm workspaces` 기반의 Monorepo 구조를 채택합니다.

* **패키지 매니저**: `npm` (npm workspaces)
* **Frontend (`ui/`)**: React 18+, Vite, TypeScript
* **Backend (`backend/`)**: Next.js (App Router 기반 API Provider), TypeScript
* **UI / Styling**: Tailwind CSS v4, Shadcn UI, Lucide Icons
* **상태 관리**:
* **클라이언트**: Zustand (전역 에이전트 선택, 유저 세션, 테마, 검색/필터 상태)
* **서버 데이터**: TanStack Query v5 (API 패칭, 동기화, 캐싱)

* **데이터베이스 (Mock)**: SQLite3 + Drizzle ORM
* **테스트**: Vitest (단위/통합)

## 4. 모노레포 디렉토리 구조 (Directory Architecture)

```text
ai-agent-hub/
├── data/                   # SQLite 데이터베이스 적재소 (mock.db)
├── assets/                 # 공통 정적 자원
│   └── logo/               # 브랜드 워드마크, 정사각 심볼 자산
│
├── docs/                   # 프로젝트 기획서, 기술 문서, API 스펙 등
│   └── blueprint/          # UI 개선 블루프린트 및 화면군별 디자인 기준
│
├── ui/                     # Vite + React 기반 프론트엔드 (SPA)
│   ├── src/
│   │   ├── app/            # App 진입점 및 Provider, 전역 레이아웃 설정
│   │   ├── pages/          # 라우트별 페이지 (/, /blueprints/:id, /lessons, /admin 등)
│   │   ├── widgets/        # 복합 UI 컴포넌트 (GlobalHeader, Sidebar, AgentList)
│   │   ├── shared/         # 공통 UI (Shadcn UI), 유틸 함수, 커스텀 훅
│   │   ├── entities/       # 도메인별 타입 및 컴포넌트 (AgentCard 등)
│   │   └── store/          # Zustand 스토어 (useHubStore, useAuthStore 등)
│   ├── vite.config.ts
│   └── tailwind.css        # Tailwind v4 진입점 (@theme 설정 포함)
│
├── backend/                # Next.js 기반 백엔드 API & Mock Server
│   ├── src/
│   │   ├── app/            # Next.js App Router (API 엔드포인트)
│   │   ├── db/             # Drizzle 스키마(schema.ts) 및 ../../data/mock.db 연결 설정
│   │   └── lib/            # 공통 백엔드 유틸리티
│   └── next.config.js
│
├── package.json            # npm workspaces 설정 ("workspaces": ["ui", "backend"])
└── package-lock.json

```

## 5. 데이터베이스 스키마 (SQLite + Drizzle ORM)

모든 데이터는 프로젝트 루트의 `data/mock.db`에 저장되어 영속성을 가집니다.

| 테이블명 | 주요 컬럼 | 설명 |
| --- | --- | --- |
| **`users`** | `id` (PK), `name`, `created_at` |  사용자 정보 (회원가입/로그인 시 이름 저장용) |
| **`categories`** | `id` (PK), `name`, `slug` | 에이전트 카테고리 (예: Multi-Agent, CLI, Vision) |
| **`agents`** | `id` (PK), `name`, `slug`, `summary`, `description`, `category_id`, `core_engine`, `github_url`, `download_url`, `created_at` | 에이전트 핵심 메타데이터 |
| **`agent_stats`** | `agent_id` (FK), `downloads`, `stars`, `views` | 정렬(Sorting) 및 필터링을 위한 통계/지표 데이터 |
| **`lessons_learned`** | `id` (PK), `user_id` (FK), `title`, `content`, `created_at` |  유저들이 작성한 기술 경험 및 노하우 공유 데이터 |

## 6. 상세 기능 및 페이지 구성 (UI/UX & Features)

### 6.1 공통 레이아웃 (Global Layout & Animations)

* **Top Navigation (최상단 Nav)**:
* 화면 최상단에 1줄 높이의 border 기반 레일로 배치합니다.
* 좌측에는 브랜드, 중앙에는 주요 메뉴, 우측에는 알림, 사용자 메뉴, 테마 토글을 둡니다.
* 알림 패널은 Nav의 높이와 무관한 오버레이 레이어로 열려야 합니다.

* **Global Background (전역 배경)**:
* 전역 배경은 단색 기반으로 유지합니다.
* 페이지 구분은 배경 효과가 아니라 border, gap, section header로 처리합니다.

* **Transitions (애니메이션)**:
* 페이지와 컴포넌트 전환은 `150ms ease-out`을 기본으로 사용합니다.
* hover 상태는 배경색 변화만 허용합니다.
* 로딩은 skeleton 또는 단색 spinner만 사용합니다.

### 6.2 인증 기능 (Auth - Mock)

* **로그인 / 회원가입 모달**:
* Top Nav에서 진입. Product-Ready 지향성에 맞춰 이메일/비밀번호 입력 폼을 제공하되, Mock 환경이므로 **'이름(Name)'**을 입력하면 `users` 테이블에 생성(또는 조회) 후 Zustand `useAuthStore`에 세션을 저장합니다.
* 모달 상단에는 브랜드 자산(`logo.png`)을 제한적으로 활용할 수 있으며, 입력 필드는 일반 사각형 폼보다 더 촉각적이고 집중감 있는 표면으로 보여야 합니다.

### 6.3 사용자 페이지 (Client Facing)

* **`/` (Home / Catalog)**
* **Category Navigation**: 좌측 사이드바 또는 상단 탭바를 통한 카테고리 필터링.
* **Sort & Filter Bar**: 최신순, 인기순, 별점순 정렬 기능.
* **Hero Surface**: 단순 소개 패널이 아니라 탐색 욕구를 자극하는 메인 스테이지처럼 보여야 합니다. 좌측에는 강한 타이틀과 제품 가치, 우측에는 선택된 전역 에이전트 하이라이트를 배치합니다. 전체 무드는 블루 기반에 보라 보조광이 흐르는 방향을 기본으로 합니다.
* **Search Surface**: 검색 입력은 화면의 중심 도구처럼 보여야 하며, 정렬과 초기화 버튼은 같은 표면 언어를 공유해야 합니다.
* **Agent Grid**: 얇은 1px 보더 기반의 카드 구조는 유지하되, 카드 자체는 더 풍부한 표면 깊이와 메트릭 칩, hover 시 lift/광량 변화/CTA 대비 상승을 가져야 합니다. 주요 CTA는 블루, 보조 무드는 보라와 골드로 분리합니다.
* **Empty / Error State**: 단순 dashed 박스가 아니라 브랜드 톤이 있는 정적 무드 패널로 설계합니다.

* **`/blueprints/:id` (Agent Detail)**
* **Hero Header**: 에이전트 명, 카테고리 배지, 생성일, 요약을 하나의 프리미엄 런치 패널처럼 구성합니다.
* **Action Buttons**: 우측 액션 영역은 단순 버튼 묶음이 아니라 즉시 실행 구역처럼 보여야 합니다. GitHub는 가장 강한 블루 CTA, 다운로드는 강한 보조 CTA로 처리합니다.
* **Metrics**: Downloads, Stars, Views는 독립적인 미니 카드처럼 보여야 하며, 숫자가 가장 강한 시각 계층을 가집니다.
* **Content Tabs**: *Overview*, *Snapshot*을 제공하며, 탭 전환은 짧은 페이드와 슬라이드를 갖습니다.
* **Overview**: 마크다운, Mermaid.js, HTML Table은 모두 동일한 One Monokai 다크 시스템 안에 통합되어야 하며, 일반 블로그보다는 제품 쇼케이스형 문서 표면처럼 보여야 합니다.

* **`/lessons` (Lessons & Learned)**
* 팀원(유저)들이 에이전트 사용 경험, 노하우, 프롬프트 엔지니어링 사례 등을 자유롭게 공유하는 공간.
* **Hero Panel**: 단순 안내 박스가 아니라 팀 지식 피드의 시작점처럼 보여야 합니다. 블루와 골드의 균형을 기본 톤으로 사용합니다.
* **List View**: 데스크톱은 Data Table 기반, 모바일은 카드 기반으로 전환 가능한 하이브리드 구조를 지향합니다. 제목은 가장 먼저 읽히고 작성자와 날짜는 보조 정보로 분리합니다.
* **Write 버튼**: 로그인한 유저만 활성화. 클릭 시 `/lessons/new` 페이지로 이동.

* **`/lessons/new` (글쓰기 페이지)**
* 제목(Title)과 내용(Content, 마크다운 에디터 또는 텍스트 에어리어) 작성 폼.
* 이 화면은 생산성 도구이자 몰입형 글쓰기 표면이어야 합니다. 제목 입력은 일반 필드보다 더 강한 계층을 가져야 하며, 에디터와 미리보기는 역할이 분명히 구분되어야 합니다. 저장과 포커스는 블루 중심, 생산성 보조 포인트는 골드로 처리합니다.
* 제출 시 `POST /api/lessons` 호출 후 `data/mock.db`의 `lessons_learned` 테이블에 저장되며, 목록으로 리다이렉트합니다. 저장 버튼은 hover, disabled, pending 상태가 모두 분명해야 합니다.

### 6.4 관리자 페이지 (Admin)

* **공통 원칙**: Admin은 화려한 마케팅 화면이 아니라 정제된 운영 콘솔이어야 합니다. 다만 현재처럼 건조한 표와 카드만 두지 않고, 깊이와 반응성을 가진 업무용 미감을 유지해야 합니다. 핵심 무드는 블루와 보라 기반으로 유지합니다.
* **`/admin` (Dashboard)**: 전체 등록 에이전트 및 작성된 Lessons 수 요약. KPI 카드는 각기 독립된 성격을 가지며, 숫자는 크게, 라벨은 단단하게 보여야 합니다.
* **`/admin/agents` (목록 관리)**: 등록된 에이전트 Data Table. 헤더 행은 더 또렷하게, 데이터 행은 빠르게 읽히게 설계하며, hover 시 관리 가능한 객체라는 느낌이 들어야 합니다.
* **`/admin/agents/new` (에이전트 등록 폼)**: React Hook Form + Zod 기반 엄격한 데이터 검증. 긴 폼을 한 덩어리 패널로 두지 않고, 기본 정보/링크와 분류/요약/상세 설명의 시각적 단계가 분리되어야 합니다.

## 7. API 스펙 (Next.js App Router - Mock)

클라이언트의 TanStack Query와 통신할 RESTful API 엔드포인트입니다.

* **Auth (Mock)**
* `POST /api/auth/login`: 유저 이름으로 인증 (없으면 가입 처리하여 `users`에 INSERT).

* **Agents & Categories**
* `GET /api/categories`
* `GET /api/agents` (필터/정렬 포함)
* `GET /api/agents/:id`

* **Lessons & Learned**
* `GET /api/lessons`: 작성된 글 목록 조회.
* `POST /api/lessons`: 새 글 등록 (Body: `userId`, `title`, `content`).

* **Admin**
* `POST /api/admin/agents`
* `PUT / DELETE /api/admin/agents/:id`
