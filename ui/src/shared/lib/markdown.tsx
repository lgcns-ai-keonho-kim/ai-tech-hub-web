/**
 * 목적: 마크다운과 Mermaid 다이어그램을 동일한 규칙으로 렌더링한다.
 * 설명: 상세 페이지와 작성 미리보기에서 같은 렌더러를 재사용해 표현 차이를 없앤다.
 * 적용 패턴: 렌더러 전략 패턴
 * 참조: ui/src/pages/agent-detail-page.tsx, ui/src/widgets/markdown-editor.tsx
 */
import { useEffect, useId, useState } from "react";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/ui/primitives/alert";
import { cn } from "@/shared/lib/cn";

type MermaidModule = typeof import("mermaid");

let mermaidModulePromise: Promise<MermaidModule> | null = null;
let mermaidInitialized = false;

function loadMermaidModule() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("mermaid");
  }

  return mermaidModulePromise;
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "div",
    "span",
  ],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    code: [...(defaultSchema.attributes?.code ?? []), ["className"]],
    div: [...(defaultSchema.attributes?.div ?? []), ["className"]],
    span: [...(defaultSchema.attributes?.span ?? []), ["className"]],
    a: [...(defaultSchema.attributes?.a ?? []), ["target"], ["rel"]],
    td: [...(defaultSchema.attributes?.td ?? []), ["align"]],
    th: [...(defaultSchema.attributes?.th ?? []), ["align"]],
  },
};

function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string>();
  const uniqueId = useId().replace(/:/g, "");

  useEffect(() => {
    let alive = true;

    async function renderChart() {
      try {
        const mermaid = await loadMermaidModule();

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            securityLevel: "loose",
            themeVariables: {
              darkMode: true,
              background: "#282C34",
              primaryColor: "#353B45",
              primaryTextColor: "#ABB2BF",
              primaryBorderColor: "#61AFEF",
              lineColor: "#61AFEF",
              secondaryColor: "#2F343F",
              secondaryTextColor: "#ABB2BF",
              tertiaryColor: "#252932",
              tertiaryTextColor: "#ABB2BF",
              mainBkg: "#2F343F",
              secondBkg: "#353B45",
              tertiaryBkg: "#252932",
              nodeTextColor: "#ABB2BF",
              clusterBkg: "#2C313A",
              clusterBorder: "#C678DD",
              edgeLabelBackground: "#282C34",
              titleColor: "#ABB2BF",
              textColor: "#ABB2BF",
              cScale0: "#61AFEF",
              cScale1: "#C678DD",
              cScale2: "#98C379",
              cScale3: "#E5C07B",
              cScale4: "#D19A66",
              cScale5: "#E06C75",
            },
          });
          mermaidInitialized = true;
        }

        const rendered = await mermaid.render(`mermaid-${uniqueId}`, chart);

        if (alive) {
          setSvg(rendered.svg);
          setError(undefined);
        }
      } catch {
        if (alive) {
          setError("Mermaid 다이어그램을 렌더링하지 못했습니다.");
        }
      }
    }

    void renderChart();

    return () => {
      alive = false;
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <Alert className="border-destructive/40 bg-destructive/10">
        <AlertTitle>다이어그램 렌더링 실패</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className="surface-panel overflow-x-auto rounded-lg p-5 [&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function MarkdownRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 text-sm leading-7 text-foreground sm:text-base", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-2xl font-medium" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="pt-3 text-xl font-medium" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-medium" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="max-w-[72ch] text-sm leading-7 text-foreground sm:text-base" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="flex list-disc flex-col gap-2.5 pl-5" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="flex list-decimal flex-col gap-2.5 pl-5" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              className="text-primary underline decoration-primary/70 underline-offset-4 hover:text-foreground"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="surface-panel-muted overflow-x-auto rounded-lg border border-border p-2">
              <table
                className="markdown-table min-w-full text-left"
                {...props}
              />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="markdown-table-head" {...props} />
          ),
          th: ({ ...props }) => (
            <th
              className="markdown-table-header-cell"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td className="markdown-table-cell" {...props} />
          ),
          code({ className: codeClassName, children, ...props }) {
            const rawCode = String(children).replace(/\n$/, "");
            const language = codeClassName?.replace("language-", "");

            if (language === "mermaid") {
              return <MermaidDiagram chart={rawCode} />;
            }

            if (language) {
              return (
                <pre className="surface-panel-muted overflow-x-auto rounded-lg border border-border p-4 text-sm leading-6 text-foreground">
                  <code className={codeClassName} {...props}>
                    {rawCode}
                  </code>
                </pre>
              );
            }

            return (
              <code
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
