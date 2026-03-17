  # ui/ 엄격 FSD 리팩토링 + Axios 도입 계획

  ## 요약

  - 현재 ui/는 기능은 동작하지만, shared/api/hooks.ts, shared/api/types.ts, pages/*.tsx, widgets/app-shell-header.tsx에 책임이 과집중되어 장기 유지보수에 불리합니다.
  - 이번 작업은 기능/화면/라우트/권한 동작을 그대로 보존하면서 내부 구조를 엄격 FSD로 일괄 이관합니다.
  - 추가 요구사항으로 fetch 기반 공통 API 호출을 axios 기반으로 교체합니다. 다만 TanStack Query는 유지하고, axios는 HTTP 클라이언트 역할만 맡깁니다.

  ## 구현 변경

  - 레이어 구조를 app / pages / widgets / features / entities / shared로 재편합니다.
      - app: router, provider, query client, axios 초기화, 전역 설정만 유지
      - pages: 라우트 엔트리와 페이지 조립만 담당
      - widgets: 페이지 수준 복합 UI
      - features: 사용자 행동 단위 로직과 UI
      - entities: 도메인 타입, query, UI 조각, 도메인 lib 소유
      - shared: shadcn primitive, 범용 유틸, 순수 공통 코드만 유지
  - shared/api/hooks.ts는 제거합니다.
      - 조회 쿼리: 각 entities/*/model/queries.ts
      - 변경 mutation: 각 features/*/model/mutations.ts
      - query key/invalidation도 각 도메인 또는 feature가 소유
  - shared/api/types.ts는 제거합니다.
      - session, asset, category, project, board, comment, notification, user 타입을 각 엔티티로 분산
      - 홈/관리자 대시보드처럼 화면 합성 응답은 owning widget 또는 page 모델에 둠
  - use-auth-store는 entities/session/model/store.ts로 이동합니다.
      - state, actions, selectors, persist key를 분리
      - 라우트 가드와 header, auth mutation은 selector만 사용
  - 대형 화면 파일을 분해합니다.
      - asset-list-page: 필터 바, 프로젝트 선택기, 뷰 토글, 카드/테이블, 페이지네이션 분리
      - asset-form-page: schema, 폼 모델, 프로젝트 선택기, 첨부 입력, 제출 액션 분리
      - asset-detail-page/board-detail-page: 본문, 댓글 목록, 댓글 작성 feature로 분리
      - app-shell-header: 네비게이션, 알림 센터, 유저 메뉴, 배지 집계로 분리
      - admin-projects-page/admin-categories-page: 생성/수정/삭제 preview-confirm 흐름을 feature로 분리
  - 반복 UI/행동을 공통화합니다.
      - 프로젝트 검색 선택기
      - 댓글 composer
      - 삭제 영향도 preview dialog
      - search param 기반 pagination/filter 모델
  - components/ui/*는 shared/ui/primitives/*로 이동합니다.
  - 모든 신규/수정 파일 상단 문서 헤더와 코드 주석은 한국어로 작성합니다.

  ## Axios 도입 방식

  - fetchApi를 제거하고 axios 단일 인스턴스로 교체합니다.
  - 공통 HTTP 기반은 shared/api/http 계층으로 둡니다.
      - client.ts: axios.create({ baseURL: "/api", timeout, headers })
      - error.ts: 상태 코드, 서버 code, 사용자 메시지를 담는 정규화 오류 타입
      - interceptors.ts 또는 동등 책임 파일: 인증 헤더, 응답 오류 정규화
  - 인증 헤더는 axios request interceptor에서 주입합니다.
      - x-user-id, x-user-role, x-user-status, x-managed-project-ids 유지
      - 헤더 값은 entities/session의 store snapshot selector로 읽음
      - shared가 세션 엔티티 내부 구현에 직접 결합되지 않도록 accessor 함수 주입 또는 좁은 의존으로 제한
  - TanStack Query와 axios를 올바르게 연결합니다.
      - queryFn은 ({ signal }) => apiClient.get(..., { signal }) 형태로 작성
      - mutation은 post/patch/delete 헬퍼 사용
      - 2xx 외 응답은 모두 명시적 예외로 승격
      - silent fallback 금지
  - 이번 작업에서 fetch와 axios를 혼용하지 않습니다.
      - ui/src 내 앱 로직 기준 HTTP 호출은 전부 axios로 통일
      - TanStack Query는 유지하므로 “서버 상태 관리”는 계속 Query가 담당
  - 성능/구조 원칙도 같이 반영합니다.
      - query 취소는 signal로 연결
      - 비긴급 검색 갱신은 useDeferredValue/startTransition 유지 또는 정리

  - bundle-barrel-imports: 내부 mega barrel 금지, 직접 경로 import 유지
  - bundle-dynamic-imports: mermaid, 차트 패널은 필요 화면에서만 동적 로딩
  - rerender-transitions: 검색/필터/search param 반영은 비긴급 업데이트로 처리

  ## PRODUCT.md 업데이트

  - 1차: 목표 FSD 레이어, import 규칙, axios 기반 HTTP 계층 정책 추가
  - 2차: 도메인 소유권 표와 entities/features/widgets 책임 경계 반영
  - 3차: 실제 이관 완료 구조, 페이지 조합 방식, 비목표 항목 기록

  ## 검증 계획

  - 로그인/회원가입/로그아웃/권한 가드가 기존과 동일해야 합니다.
  - 관리자 프로젝트/카테고리 생성, 수정, 삭제 preview-confirm 흐름이 동일해야 합니다.
  - 알림 읽음 처리, 프로젝트 승인 처리, 마이페이지 수정이 동일해야 합니다.
  - axios 전환 후 기존 헤더 기반 Mock 인증 컨텍스트가 동일하게 전달되어야 합니다.
  - 사용자 실행 명령:
      - npm run test --workspace ui

  ## 기본 가정

  - backend API 엔드포인트와 응답 shape는 변경하지 않습니다.
  - 이번 작업은 구조 개선이 목적이며 기능 추가는 하지 않습니다.
  - processes 레이어는 실제 다단계 플로우가 확인될 때만 도입하고 이번에는 추가하지 않습니다.
  - 공통화는 실제 2회 이상 반복되는 책임에만 적용합니다.
  - UI의 시각적 결과는 유지 우선이며, 구조 분리 과정에서 필요한 최소 수준만 손봅니다.