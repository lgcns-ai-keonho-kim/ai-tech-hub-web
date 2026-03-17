/**
 * 목적: 단일 Cloud Run 서비스에서 SPA 셸을 반환한다.
 * 설명: `/api`와 정적 자산을 제외한 브라우저 라우팅 경로는 빌드된 `ui`의 `index.html`을 반환하고, 개발 중 파일이 없으면 API 안내 화면을 보여준다.
 * 적용 패턴: SPA 셸 라우팅 패턴
 * 참조: backend/src/app/api, ui/src/app/router.tsx
 */
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

import type { NextRequest } from "next/server";

const spaShellPath = resolve(process.cwd(), "public", "spa", "index.html");
const excludedPrefixes = ["/api", "/_next", "/assets"];
const excludedExactPaths = new Set(["/favicon.ico", "/robots.txt", "/sitemap.xml"]);

export const runtime = "nodejs";

function shouldServeSpaShell(pathname: string) {
  if (excludedExactPaths.has(pathname)) {
    return false;
  }

  if (excludedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }

  return extname(pathname) === "";
}

function createHtmlResponse(html: string) {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function createFallbackHtml() {
  return [
    "<!doctype html>",
    '<html lang="ko">',
    "  <head>",
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    "    <title>AI Agent Hub Mock API</title>",
    "    <style>",
    "      body {",
    "        min-height: 100vh;",
    "        margin: 0;",
    "        display: grid;",
    "        place-items: center;",
    "        background: #09090b;",
    "        color: #fafafa;",
    "        font-family: sans-serif;",
    "      }",
    "      .shell {",
    "        padding: 24px;",
    "        max-width: 520px;",
    "      }",
    "      h1 {",
    "        font-size: 1.5rem;",
    "        margin: 0 0 0.75rem;",
    "      }",
    "      p {",
    "        margin: 0;",
    "        line-height: 1.6;",
    "      }",
    "    </style>",
    "  </head>",
    "  <body>",
    '    <main class="shell">',
    "      <h1>AI Agent Hub Mock API</h1>",
    '      <p>빌드된 UI가 없어서 API 안내 화면을 보여주고 있습니다. <code>/api</code> 경로를 통해 데이터에 접근할 수 있습니다.</p>',
    "    </main>",
    "  </body>",
    "</html>",
  ].join("\n");
}

async function loadSpaShell() {
  try {
    return await readFile(spaShellPath, "utf8");
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (!shouldServeSpaShell(pathname)) {
    return new Response("Not found", { status: 404 });
  }

  const spaShell = await loadSpaShell();
  return createHtmlResponse(spaShell ?? createFallbackHtml());
}

export async function HEAD(request: NextRequest) {
  const response = await GET(request);
  return new Response(null, { status: response.status, headers: response.headers });
}
