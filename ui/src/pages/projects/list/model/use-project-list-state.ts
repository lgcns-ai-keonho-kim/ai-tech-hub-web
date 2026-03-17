/**
 * 목적: 프로젝트 목록 페이지의 검색/페이지네이션 상태를 관리한다.
 * 설명: 검색어 입력, IME 조합 상태, 페이지 계산을 페이지 모델로 분리해 UI와 책임을 나눈다.
 * 적용 패턴: 페이지 모델 패턴
 * 참조: ui/src/pages/projects/list/ui/page.tsx, ui/src/widgets/project-list/ui/project-list-card.tsx
 */
import { type FormEvent, useEffect, useMemo, useState } from "react";

export function useProjectListState() {
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isComposing, setIsComposing] = useState(false);
  const normalizedQuery = query.trim();

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isComposing) {
      return;
    }

    setQuery(draftQuery);
    setPage(1);
  };

  return {
    draftQuery,
    normalizedQuery,
    page,
    setDraftQuery,
    setIsComposing,
    setPage,
    handleSearchSubmit,
  };
}
