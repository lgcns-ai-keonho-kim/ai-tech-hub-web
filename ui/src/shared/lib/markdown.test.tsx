/**
 * 목적: 마크다운 렌더러의 텍스트, 표, Mermaid 처리 흐름을 검증한다.
 * 설명: 상세 페이지와 미리보기의 핵심 렌더링 경로가 깨지지 않도록 보장한다.
 * 적용 패턴: 렌더러 테스트 패턴
 * 참조: ui/src/shared/lib/markdown.tsx
 */
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { mermaidRender } = vi.hoisted(() => ({
  mermaidRender: vi.fn().mockResolvedValue({
    svg: "<svg><text>diagram</text></svg>",
  }),
}));

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: mermaidRender,
  },
}));

import { MarkdownRenderer } from "@/shared/lib/markdown";

describe("MarkdownRenderer", () => {
  it("표와 Mermaid 블록을 함께 렌더링한다", async () => {
    const content = `# 제목

| 항목 | 값 |
| --- | --- |
| A | B |

\`\`\`mermaid
graph TD;
  A-->B;
\`\`\``;

    const { container } = render(<MarkdownRenderer content={content} />);

    expect(screen.getByRole("heading", { name: "제목" })).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();

    await waitFor(() => {
      expect(mermaidRender).toHaveBeenCalled();
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });
});
