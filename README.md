<!--
목적: AssetTechHub 모노레포의 로컬 실행과 Cloud Run 배포 방법을 한 문서에서 정리한다.
설명: 워크스페이스 구조, 환경 변수 계약, Docker/Cloud Run 단일 서비스 구성, SQLite 제약을 한국어로 안내한다.
적용 패턴: 운영 문서 패턴
참조: package.json, Dockerfile, .env.sample, backend/, ui/
-->

# AI Agent Hub

AssetTechHub는 **Vite 기반 React UI**와 **Next.js App Router 기반 API 서버**를 하나의 모노레포에서 운영하는 로컬 프로토타이핑 프로젝트입니다.  
로컬에서는 `ui`와 `backend`를 분리 실행하고, Cloud Run에서는 **단일 컨테이너**가 빌드된 UI 정적 파일과 `/api`를 함께 서빙합니다.

## 프로젝트 구성

- `ui/`
  - Vite + React + TypeScript 기반 SPA
  - 브라우저 라우팅은 `react-router-dom`
  - API 호출은 same-origin `/api/*`
- `backend/`
  - Next.js App Router 기반 API 서버
  - Cloud Run 단일 서비스 진입점
  - production에서는 빌드된 `ui` 정적 파일도 함께 서빙
- `data/`
  - 필요 시 로컬에서 고정 SQLite 파일을 두고 싶을 때 사용할 수 있는 디렉터리
  - 기본 경로는 더 이상 여기로 고정하지 않습니다
- 루트 `Dockerfile`
  - Cloud Run 단일 서비스용 멀티 스테이지 이미지 빌드

## 환경 변수

루트 `.env.sample`을 복사해서 `.env`로 사용합니다.

```bash
cp .env.sample .env
```

기본값은 다음과 같습니다.

```bash
FRONTEND_PORT=5173
BACKEND_PORT=3000
SQLITE_PATH=/tmp/asset-tech-hub/mock.db
```

설명:

- `FRONTEND_PORT`
  - 로컬 `ui` Vite 개발 서버 포트
- `BACKEND_PORT`
  - 로컬 `backend` Next.js 개발 서버 포트
- `SQLITE_PATH`
  - SQLite 파일 경로
  - 기본값은 **Cloud Run에서도 바로 쓸 수 있는 경로**인 `/tmp/asset-tech-hub/mock.db`
  - 로컬에서 저장 파일을 프로젝트 디렉터리에 고정하고 싶으면 예를 들어 `SQLITE_PATH=data/mock.db`로 바꿀 수 있습니다

## 로컬 개발

의존성 설치:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install
```

전체 실행:

```bash
npm run dev
```

개별 실행:

```bash
npm run dev:backend
npm run dev:ui
```

동작 방식:

- `ui`는 루트 `.env`를 읽어 Vite 포트와 `/api` 프록시 타깃을 결정합니다
- `backend`는 같은 루트 `.env`를 읽어 Next.js dev/start 포트와 SQLite 경로를 결정합니다
- `backend`의 로컬 `dev/start`는 실행 직전에 `db:init`를 먼저 실행해 항상 같은 샘플 데이터로 시작합니다
- `.env`가 없어도 기본값으로 동작하지만, 팀 공통 계약은 `.env.sample` 기준으로 관리합니다

## Cloud Run 단일 서비스 구성

현재 저장소는 Cloud Run에서 **단일 서비스**로 운영할 수 있게 구성됩니다.

production 컨테이너에서의 동작:

- `ui`는 Vite로 build 됩니다
- 빌드된 정적 파일은 `backend/public`으로 복사됩니다
- builder 단계에서 `backend` build가 끝난 뒤 SQLite 시드 DB를 명시 생성합니다
- runner 이미지는 build 시 생성된 `/tmp/asset-tech-hub/mock.db`를 그대로 포함해 시작합니다
- `backend`는 `/api/*`는 API로 처리하고, 나머지 브라우저 라우팅 경로는 SPA 셸(`index.html`)을 반환합니다
- 결과적으로 Cloud Run 서비스 하나가 UI와 API를 같은 도메인에서 함께 서빙합니다

### UI 혼합 차트 구현 메모

프로젝트 단계 차트는 `bar + line`을 섞는 **mixed chart**입니다.  
이 부분은 `react-chartjs-2` wrapper가 아니라 **순수 Chart.js 인스턴스**로 직접 렌더링하도록 정리했습니다.

이렇게 한 이유:

- 공식 Chart.js mixed chart는 dataset마다 `type`을 다르게 두는 구성을 전제로 함
- 하지만 `react-chartjs-2`의 일반 `ChartProps<TType>`는 단일 `TType` 중심이라 mixed chart 타입과 장기적으로 충돌하기 쉬움
- 지금처럼 Docker 빌드에서 `tsc -b`를 강하게 돌리는 구조에서는 버전이 조금만 바뀌어도 wrapper 제네릭 충돌이 다시 터질 가능성이 큼

따라서 현재 구현은 의도적으로 다음 원칙을 따릅니다.

- mixed chart는 `ProjectStageSummaryPanel`에서 공식 Chart.js config를 만든다
- lazy-loaded 차트 컴포넌트는 `canvas`에 Chart.js 인스턴스를 직접 생성/파괴한다
- `react-chartjs-2`의 타입 우회 캐스팅으로 억지 통과시키지 않는다

이 결정은 **지금 빌드만 통과시키기 위한 임시 조치가 아니라**, 이후 의존성 업데이트와 본서비스 배포 시 반복 작업을 줄이기 위한 구조적 선택입니다.

### 주의: SQLite는 데모/임시 용도입니다

Cloud Run의 파일시스템은 **비영속적**입니다.  
따라서 기본 `SQLITE_PATH=/tmp/asset-tech-hub/mock.db`는 다음 성격으로 봐야 합니다.

- 인스턴스 재시작, 재배포, 스케일 아웃/인 시 데이터가 유지되지 않을 수 있음
- 현재 프로젝트의 Mock/프로토타입 목적에는 적합
- 영속 데이터가 필요하면 Cloud SQL, Firestore, GCS 등 별도 저장 전략이 필요

## 현재 공용 헬퍼와 PostgreSQL 전환 시 유의사항

이번 작업에서 Cloud Run과 로컬 개발을 동시에 맞추기 위해 몇 가지 **공용 헬퍼/공용 계약**을 추가했습니다.  
이 부분은 지금 단계에서는 실용적이지만, **정식 DB를 PostgreSQL로 전환해 운영 배포**할 때는 반드시 다시 손봐야 합니다.

### 1. `SQLITE_PATH` 기반 경로 헬퍼

현재는 `backend/src/db/paths.ts`에서 SQLite 파일 경로를 한 곳에서 결정합니다.

역할:

- 로컬과 Cloud Run이 같은 환경 변수 계약을 사용하도록 맞춤
- `.env.sample`의 `SQLITE_PATH`를 기준으로 DB 파일 위치를 결정
- 값이 없으면 `/tmp/asset-tech-hub/mock.db`를 기본값으로 사용

이 설계가 필요한 이유:

- 로컬 개발에서는 파일 기반 SQLite가 가장 단순함
- Cloud Run 데모 환경에서는 `/tmp` 기반 SQLite를 빠르게 준비할 수 있음

하지만 PostgreSQL 전환 시에는 이 전제가 더 이상 맞지 않습니다.

- PostgreSQL은 파일 경로가 아니라 **연결 문자열** 또는 `host`, `port`, `user`, `password`, `database` 같은 네트워크 설정이 핵심입니다
- 따라서 `SQLITE_PATH` 중심의 현재 경로 헬퍼는 제거하거나, SQLite 전용 개발 모드로만 남기고 production DB 설정은 완전히 분리해야 합니다

권장 방향:

- `DATABASE_URL` 같은 단일 연결 문자열을 표준으로 도입
- SQLite 전용 경로 계산 로직은 개발 전용 분기로 격리
- `backend/src/db/index.ts`의 연결 생성과 초기화 실행 시점을 드라이버별로 분리

### 2. 명시 초기화 전제

현재는 SQLite bootstrap을 import 시점이 아니라 **명시 초기화 단계**로 분리했습니다.

역할:

- 로컬 `dev/start` 진입 전에 `db:init`를 실행해 항상 같은 샘플 데이터로 시작하게 함
- Docker builder 단계에서 시드 DB를 생성하고 runner 이미지에 포함시킴
- 앱 런타임은 준비된 SQLite 파일에 연결만 수행함

PostgreSQL 운영 전환 시 주의할 점:

- 운영 DB에서는 애플리케이션 프로세스가 부팅될 때마다 임의로 schema/bootstrap/seed를 수행하면 안 됩니다
- 마이그레이션, 초기 데이터 적재, 관리자 계정 생성은 앱 런타임과 분리된 **배포 단계** 또는 **운영 스크립트**로 관리해야 합니다

즉, 지금의 bootstrap 방식은 다음 목적에만 적합합니다.

- Mock API 데모
- 로컬 개발
- 임시 검증 환경

정식 PostgreSQL 배포 시에는 다음처럼 바꿔야 합니다.

- 앱 시작 시 DB 연결만 수행
- schema 변경은 Drizzle migration 또는 별도 배포 job으로 수행
- seed 데이터는 선택적 운영 스크립트로 분리

### 3. Docker/Cloud Run 문서의 현재 전제

현재 README와 Dockerfile은 다음 전제를 깔고 있습니다.

- 단일 Cloud Run 서비스
- same-origin `/api`
- 정적 UI + Next API + 임시 SQLite

이 전제는 데모/프로토타입에는 잘 맞지만, PostgreSQL 운영 배포에서는 보통 아래를 추가로 검토해야 합니다.

- Cloud SQL(PostgreSQL) 연결 방식
- 비밀값 관리: Cloud Run Variables & Secrets 또는 Secret Manager
- migration 실행 타이밍
- 운영용 seed 데이터 분리 여부
- connection pooling 전략
- 장애 시 재시도/타임아웃 정책

즉, 지금 Dockerfile은 **“현재 구조를 Cloud Run에서 빠르게 데모 배포하기 위한 컨테이너”**로 이해하는 것이 맞고,  
**PostgreSQL 운영 배포용 최종 인프라 설계 문서**로 보면 안 됩니다.

### 4. 추후 PostgreSQL 배포 시 실제로 수정해야 할 위치

후속 작업에서 우선적으로 다시 볼 파일은 아래입니다.

- `backend/src/db/paths.ts`
  - SQLite 전용 경로 결정 로직
- `backend/src/db/index.ts`
  - SQLite 파일 생성, bootstrap, better-sqlite3 초기화
- `backend/src/db/scripts/init-db.ts`
  - 파일 기반 초기화 스크립트
- `.env.sample`
  - `SQLITE_PATH` 대신 `DATABASE_URL` 또는 Postgres 접속 환경 변수 추가 필요
- `README.md`
  - 데모 기준 설명에서 운영 배포 기준 설명으로 전환 필요

### 5. 지금 상태를 어떻게 이해하면 되는가

현재 추가된 공용 헬퍼는 **“SQLite 기반 Mock 환경을 로컬과 Cloud Run 데모에서 동일하게 돌리기 위한 임시 운영 편의 계층”**입니다.

중요한 해석:

- 지금은 구조적으로 문제가 있는 임시 땜질이 아니라, **현재 요구사항에 맞는 최소 운영 계층**
- 다만 PostgreSQL 정식 운영 환경까지 포괄하는 영구 아키텍처는 아님
- 따라서 추후 DB 전환 작업에서는 이 공용 헬퍼를 **재사용할지 여부부터 다시 판단**해야 함

정리하면:

- 지금의 `SQLITE_PATH`, 명시 재시드, `/tmp` 기본값은 **의도된 데모 전략**
- PostgreSQL 배포 단계에서는 이 전략을 그대로 가져가면 안 됨
- 그 시점에는 DB 연결 계약, migration 방식, secret 관리 방식을 중심으로 인프라 문서를 다시 써야 합니다

## Docker 이미지 빌드

루트에서 이미지를 빌드합니다.

```bash
docker build -t asset-tech-hub .
```

로컬 컨테이너 실행 예시:

```bash
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e SQLITE_PATH=/tmp/asset-tech-hub/mock.db \
  asset-tech-hub
```

확인 경로:

- 앱: `http://localhost:8080`
- 헬스체크: `http://localhost:8080/api/health`

## Cloud Run 배포 예시

Artifact Registry 또는 Container Registry에 푸시한 뒤 Cloud Run에 배포합니다.

이미지 빌드/푸시 예시:

```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/lgcns-genai-coe/cloud-run-source-deploy/asset-tech-hub:latest
```

배포 예시:

```bash
gcloud run deploy asset-tech-hub \
  --image us-central1-docker.pkg.dev/lgcns-genai-coe/cloud-run-source-deploy/asset-tech-hub:latest \
  --region us-central1 \
  --cpu 2 \
  --memory 4Gi \
  --port 8080 \
  --allow-unauthenticated \
  --ingress all \
  --set-env-vars SQLITE_PATH=/tmp/asset-tech-hub/mock.db
```

Cloud Run 런타임 메모:

- `PORT`는 Cloud Run이 자동으로 주입합니다
- 이 프로젝트는 `PORT`를 우선 사용하도록 맞춰져 있습니다
- 별도로 `FRONTEND_PORT`, `BACKEND_PORT`를 Cloud Run에 넣을 필요는 없습니다

## 테스트

테스트는 자동 실행하지 않았습니다. 아래 명령을 직접 사용해 주세요.

```bash
npm run test --workspace ui
npm run test --workspace backend
```
