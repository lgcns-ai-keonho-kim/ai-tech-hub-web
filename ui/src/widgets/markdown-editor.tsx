/**
 * 목적: 제목 없는 경량 마크다운 편집기와 표 삽입 도우미를 제공한다.
 * 설명: 별도 외부 에디터 의존성 없이 본문 작성과 필요 시 시각적 표 삽입을 지원한다.
 * 적용 패턴: 컨트롤드 컴포넌트 패턴
 * 참조: ui/src/pages/new-lesson-page.tsx, ui/src/pages/admin-new-agent-page.tsx
 */
import { useRef } from "react";

import { Textarea } from "@/shared/ui/primitives/textarea";
import { cn } from "@/shared/lib/cn";
import { MarkdownRenderer } from "@/shared/lib/markdown";
import { MarkdownTableHelper } from "@/widgets/markdown-table-helper";

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minHeightClassName = "min-h-[360px]",
  showPreview = true,
  tableHelperEnabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
  showPreview?: boolean;
  tableHelperEnabled?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInsertTable(markdown: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      onChange(`${value}${markdown}`);
      return;
    }

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const nextValue =
      value.slice(0, selectionStart) +
      markdown +
      value.slice(selectionEnd);

    onChange(nextValue);

    requestAnimationFrame(() => {
      const nextCursorPosition = selectionStart + markdown.length;
      textarea.focus();
      textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("grid gap-4", showPreview && "lg:grid-cols-2")}>
        <section className="surface-panel edge-highlight rounded-lg p-4">
          <div className="flex flex-col gap-3">
            <div className="section-title">작성</div>
            {tableHelperEnabled ? <MarkdownTableHelper onInsert={handleInsertTable} /> : null}
          </div>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={cn(
              minHeightClassName,
              "resize-none rounded-lg border-border bg-background p-5 text-sm leading-7",
            )}
          />
        </section>
      {showPreview ? (
        <section className="surface-panel edge-highlight rounded-lg p-4">
          <div className="section-title">미리보기</div>
          <div className={cn(minHeightClassName, "overflow-y-auto rounded-lg border border-border bg-background/45 p-4")}>
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                미리보기에 표시할 내용이 없습니다.
              </div>
            )}
          </div>
        </section>
      ) : null}
      </div>
    </div>
  );
}
