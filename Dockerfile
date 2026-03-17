# syntax=docker/dockerfile:1.7
#
# 목적: AssetTechHub 모노레포를 Cloud Run 단일 서비스용 이미지로 빌드한다.
# 설명: ui의 정적 산출물을 backend가 함께 서빙하도록 묶고, backend Next.js 서버를 production 모드로 실행한다.
# 적용 패턴: 멀티 스테이지 빌드 패턴
# 참조: package.json, backend/package.json, ui/package.json

FROM node:24-bookworm-slim AS deps
WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY ui/package.json ui/package.json

RUN npm ci

FROM node:24-bookworm-slim AS builder
WORKDIR /workspace

COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/package.json ./package.json
COPY --from=deps /workspace/package-lock.json ./package-lock.json
COPY --from=deps /workspace/backend/package.json ./backend/package.json
COPY --from=deps /workspace/ui/package.json ./ui/package.json
COPY . .

RUN npm run build --workspace ui
RUN mkdir -p backend/public/spa \
  && cp -R ui/dist/. backend/public/ \
  && cp ui/dist/index.html backend/public/spa/index.html
RUN npm run build --workspace backend
RUN mkdir -p /tmp/asset-tech-hub \
  && npm run db:init --workspace backend
RUN npm prune --omit=dev

FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080
ENV SQLITE_PATH=/tmp/asset-tech-hub/mock.db

RUN mkdir -p /tmp/asset-tech-hub

COPY --from=builder /workspace/node_modules ./node_modules
COPY --from=builder /workspace/backend/.next ./backend/.next
COPY --from=builder /workspace/backend/public ./backend/public
COPY --from=builder /workspace/backend/scripts ./backend/scripts
COPY --from=builder /workspace/backend/package.json ./backend/package.json
COPY --from=builder /workspace/backend/next.config.ts ./backend/next.config.ts
COPY --from=builder /tmp/asset-tech-hub/mock.db /tmp/asset-tech-hub/mock.db

EXPOSE 8080

CMD ["node", "backend/scripts/run-next-with-root-env.mjs", "start"]
