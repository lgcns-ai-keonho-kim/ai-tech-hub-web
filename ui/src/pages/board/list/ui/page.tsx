/**
 * 목적: 공지사항과 Q&A를 하나의 게시판 화면에서 렌더링한다.
 * 설명: 탭 전환으로 게시글 목록과 작성 폼을 현재 게시판 종류에 맞게 제공한다.
 * 적용 패턴: 게시판 화면 패턴
 * 참조: ui/src/shared/api/hooks.ts, ui/src/shared/constants/asset-domain.ts
 */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import {
  Field,
  FieldLabel,
} from "@/shared/ui/primitives/field";
import { Input } from "@/shared/ui/primitives/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/primitives/table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/primitives/tabs";
import { Textarea } from "@/shared/ui/primitives/textarea";
import { useBoardPostsQuery } from "@/entities/board/model/queries";
import type { BoardType } from "@/entities/board/model/types";
import { useCreateBoardPostMutation } from "@/features/board-actions/model/mutations";
import { getBoardTypeLabel } from "@/entities/asset/lib/labels";
import { formatDate } from "@/shared/lib/format";
import { SectionHero } from "@/shared/ui/section-hero";
import { useAuthStore } from "@/entities/session/model/store";

const boardTabs: BoardType[] = ["notice", "qna"];

export function BoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("tab") === "qna" ? "qna" : "notice";
  const postsQuery = useBoardPostsQuery(type);
  const createPostMutation = useCreateBoardPostMutation();
  const session = useAuthStore((state) => state.session);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const canWrite = session?.user.globalRole === "admin";

  return (
    <div className="flex flex-col gap-6">
      <SectionHero
        eyebrow="게시판"
        title="게시판"
        description="공지사항과 Q&A를 한 화면에서 전환하며 확인할 수 있습니다."
        titleClassName="font-normal"
        actions={
          canWrite ? (
            <Button
              type="button"
              className="rounded-md"
              onClick={() => setIsComposerOpen((current) => !current)}
            >
              {isComposerOpen ? "작성 닫기" : "등록하기"}
            </Button>
          ) : undefined
        }
      />

      <Tabs
        value={type}
        onValueChange={(value) => {
          const next = new URLSearchParams(searchParams);
          if (value === "notice") {
            next.delete("tab");
          } else {
            next.set("tab", value);
          }
          setSearchParams(next);
        }}
        className="gap-4"
      >
        <TabsList variant="line" className="surface-panel-muted rounded-md border-border p-1">
          {boardTabs.map((item) => (
            <TabsTrigger key={item} value={item} className="rounded-md px-5 data-[state=active]:bg-primary/12">
              {getBoardTypeLabel(item)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {canWrite && isComposerOpen ? (
        <Card className="surface-panel rounded-lg border-border bg-transparent">
          <CardHeader>
            <CardTitle>{getBoardTypeLabel(type)} 작성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor={`${type}-title`}>제목</FieldLabel>
              <Input
                id={`${type}-title`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-9 rounded-md border-border bg-background"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${type}-content`}>내용</FieldLabel>
              <Textarea
                id={`${type}-content`}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-40 rounded-lg border-border bg-background"
              />
            </Field>
            <Button
              type="button"
              className="rounded-md"
              disabled={title.trim().length < 2 || content.trim().length < 10 || createPostMutation.isPending}
              onClick={async () => {
                await createPostMutation.mutateAsync({ type, title, content });
                setTitle("");
                setContent("");
                setIsComposerOpen(false);
              }}
            >
              {createPostMutation.isPending ? "등록 중..." : "등록하기"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="surface-panel overflow-hidden rounded-lg border-border">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-5 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground">
                제목
              </TableHead>
              <TableHead className="px-4 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground">
                내용
              </TableHead>
              <TableHead className="px-4 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground">
                작성자
              </TableHead>
              <TableHead className="px-4 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground">
                댓글
              </TableHead>
              <TableHead className="px-5 py-4 text-center text-xs font-medium tracking-[0.12em] text-muted-foreground">
                작성 일자
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(postsQuery.data ?? []).map((post) => (
              <TableRow
                key={post.id}
                className="group/list-row border-border transition-[background-color] duration-150 ease-out hover:bg-accent/70 focus-within:bg-accent/70"
              >
                <TableCell className="px-5 py-4 text-left align-top">
                  <Link
                    to={`/board/${type}/${post.id}`}
                    className="relative inline-block max-w-full truncate text-sm font-normal text-foreground transition-[color,transform] duration-150 ease-out after:absolute after:right-0 after:-bottom-0.5 after:left-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-150 after:ease-out hover:text-primary hover:after:scale-x-100 focus-visible:text-primary focus-visible:after:scale-x-100 group-hover/list-row:translate-x-0.5 group-focus-within/list-row:translate-x-0.5"
                  >
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-4 text-left align-top">
                  <Link
                    to={`/board/${type}/${post.id}`}
                    className="block min-w-[260px] text-sm leading-6 text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground group-hover/list-row:translate-x-0.5 group-hover/list-row:text-foreground group-focus-within/list-row:translate-x-0.5 group-focus-within/list-row:text-foreground"
                  >
                    {post.contentPreview}
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-4 text-left align-top text-sm text-foreground/90 transition-colors duration-150 ease-out group-hover/list-row:text-foreground group-focus-within/list-row:text-foreground">
                  {post.authorName}
                </TableCell>
                <TableCell className="px-4 py-4 text-left align-top text-sm text-foreground/90 transition-colors duration-150 ease-out group-hover/list-row:text-foreground group-focus-within/list-row:text-foreground">
                  {post.commentCount}
                </TableCell>
                <TableCell className="px-5 py-4 text-left align-top text-sm text-muted-foreground transition-colors duration-150 ease-out group-hover/list-row:text-foreground/80 group-focus-within/list-row:text-foreground/80">
                  {formatDate(post.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
