/**
 * 목적: 마크다운 표를 시각적으로 작성하고 본문에 삽입하는 도우미를 제공한다.
 * 설명: 헤더와 셀 값을 표 형태로 입력하면 마크다운 문법 문자열을 생성해 에디터에 삽입한다.
 * 적용 패턴: 헬퍼 다이얼로그 패턴
 * 참조: ui/src/widgets/markdown-editor.tsx, ui/src/shared/lib/markdown.tsx
 */
import { useEffect, useState } from "react";

import { Table2 } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/primitives/table";

const MIN_COLUMNS = 2;
const MAX_COLUMNS = 6;
const MIN_BODY_ROWS = 1;
const MAX_BODY_ROWS = 8;
const DEFAULT_COLUMNS = 3;
const DEFAULT_BODY_ROWS = 2;

function createGrid(columnCount: number, bodyRowCount: number) {
  return Array.from({ length: bodyRowCount + 1 }, (_, rowIndex) =>
    Array.from({ length: columnCount }, (_, columnIndex) =>
      rowIndex === 0 ? `헤더 ${columnIndex + 1}` : "",
    ),
  );
}

function resizeGrid(
  previousGrid: string[][],
  columnCount: number,
  bodyRowCount: number,
) {
  return Array.from({ length: bodyRowCount + 1 }, (_, rowIndex) =>
    Array.from({ length: columnCount }, (_, columnIndex) => {
      const previousValue = previousGrid[rowIndex]?.[columnIndex];

      if (previousValue !== undefined) {
        return previousValue;
      }

      return rowIndex === 0 ? `헤더 ${columnIndex + 1}` : "";
    }),
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeTableCell(value: string) {
  return value.trim().replace(/\|/g, "\\|").replace(/\n/g, "<br />");
}

function buildMarkdownTable(grid: string[][]) {
  const headerCells = grid[0].map((cell, index) => {
    const normalized = normalizeTableCell(cell);
    return normalized || `항목 ${index + 1}`;
  });
  const separatorCells = headerCells.map(() => "---");
  const bodyRows = grid.slice(1).map((row) =>
    `| ${row.map((cell) => normalizeTableCell(cell)).join(" | ")} |`,
  );

  return [
    "",
    `| ${headerCells.join(" | ")} |`,
    `| ${separatorCells.join(" | ")} |`,
    ...bodyRows,
    "",
  ].join("\n");
}

export function MarkdownTableHelper({
  onInsert,
}: {
  onInsert: (markdown: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [columnCount, setColumnCount] = useState(DEFAULT_COLUMNS);
  const [bodyRowCount, setBodyRowCount] = useState(DEFAULT_BODY_ROWS);
  const [grid, setGrid] = useState(() =>
    createGrid(DEFAULT_COLUMNS, DEFAULT_BODY_ROWS),
  );

  useEffect(() => {
    setGrid((previousGrid) =>
      resizeGrid(previousGrid, columnCount, bodyRowCount),
    );
  }, [columnCount, bodyRowCount]);

  function updateCell(rowIndex: number, columnIndex: number, value: string) {
    setGrid((previousGrid) =>
      previousGrid.map((row, currentRowIndex) =>
        row.map((cell, currentColumnIndex) => {
          if (
            currentRowIndex === rowIndex &&
            currentColumnIndex === columnIndex
          ) {
            return value;
          }

          return cell;
        }),
      ),
    );
  }

  function resetGrid() {
    setColumnCount(DEFAULT_COLUMNS);
    setBodyRowCount(DEFAULT_BODY_ROWS);
    setGrid(createGrid(DEFAULT_COLUMNS, DEFAULT_BODY_ROWS));
  }

  function handleInsert() {
    onInsert(buildMarkdownTable(grid));
    setOpen(false);
    resetGrid();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="rounded-md border-border bg-background"
        onClick={() => setOpen(true)}
      >
        <Table2 strokeWidth={1.5} data-icon="inline-start" />
        표 삽입
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl rounded-lg border-border bg-background p-0 ">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>표 도우미</DialogTitle>
            <DialogDescription>
              첫 줄은 헤더로 사용됩니다. 셀 값을 시각적으로 채운 뒤 본문에 삽입하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-panel-muted rounded-lg border border-border p-4">
                <div className="text-sm font-medium text-foreground">표 크기</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    열 수
                    <Input
                      type="number"
                      min={MIN_COLUMNS}
                      max={MAX_COLUMNS}
                      value={columnCount}
                      onChange={(event) =>
                        setColumnCount(
                          clamp(
                            Number(event.target.value) || DEFAULT_COLUMNS,
                            MIN_COLUMNS,
                            MAX_COLUMNS,
                          ),
                        )
                      }
                      className="h-11 rounded-lg border-border bg-background"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    본문 행 수
                    <Input
                      type="number"
                      min={MIN_BODY_ROWS}
                      max={MAX_BODY_ROWS}
                      value={bodyRowCount}
                      onChange={(event) =>
                        setBodyRowCount(
                          clamp(
                            Number(event.target.value) || DEFAULT_BODY_ROWS,
                            MIN_BODY_ROWS,
                            MAX_BODY_ROWS,
                          ),
                        )
                      }
                      className="h-11 rounded-lg border-border bg-background"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="surface-panel rounded-lg border border-border p-4">
              <div className="mb-3 text-sm font-medium text-foreground">
                표 상세 편집
              </div>
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {grid[0].map((cell, columnIndex) => (
                      <TableHead
                        key={`head-${columnIndex}`}
                        className="bg-muted/40 px-3 py-3 align-top"
                      >
                        <Input
                          value={cell}
                          onChange={(event) =>
                            updateCell(0, columnIndex, event.target.value)
                          }
                          className="h-11 rounded-md border-border bg-background text-sm text-foreground"
                        />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grid.slice(1).map((row, rowIndex) => (
                    <TableRow
                      key={`row-${rowIndex}`}
                      className="border-border hover:bg-transparent"
                    >
                      {row.map((cell, columnIndex) => (
                        <TableCell
                          key={`cell-${rowIndex}-${columnIndex}`}
                          className="px-3 py-3 align-top"
                        >
                          <Input
                            value={cell}
                            onChange={(event) =>
                              updateCell(
                                rowIndex + 1,
                                columnIndex,
                                event.target.value,
                              )
                            }
                            placeholder={`값 ${rowIndex + 1}-${columnIndex + 1}`}
                            className="h-11 rounded-md border-border bg-background text-sm text-foreground"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-md border-border bg-background"
                onClick={resetGrid}
              >
                초기화
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md border-border bg-background"
                  onClick={() => setOpen(false)}
                >
                  닫기
                </Button>
                <Button
                  type="button"
                  className="rounded-md px-3"
                  onClick={handleInsert}
                >
                  표 본문에 삽입
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
