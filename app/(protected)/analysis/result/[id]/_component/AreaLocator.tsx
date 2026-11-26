"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import {
  ApiError,
  getAreaPolygon,
  locateAreas,
  searchAreas,
  type AreaLocateResult,
  type AreaSearchItem,
} from "@/api/analysis/analysis.api";
import { searchPlace, type PlacePoint } from "@/lib/kakaoMap";
import HighlightText from "../../../_component/HighlightText";
import useDebounce from "../../../_component/useDebounce";

type Status = "idle" | "loading" | "noPlace" | "error" | "done";

export type LocatorState = {
  point: PlacePoint | null;
  result: AreaLocateResult | null;
  selectedCode: string | null;
};

type Props = {
  value: LocatorState;
  onChange: (next: LocatorState) => void;
  error?: string | null; // 바깥(URL 로 불러온 상권 등)에서 생긴 오류 문구
  onEdit?: () => void; // 입력을 다시 시작할 때 (바깥 오류 해제용)
};

const NOT_FOUND = "검색 결과가 없습니다";

// 주소/장소 검색 → 좌표 → 백엔드 상권 조회. 지도 그리기는 KakaoMap 이 담당한다.
// 입력 중에는 입력폼과 같은 상권 자동완성(searchAreas)이 뜨고, 고르면 그 상권 폴리곤을 바로 보여준다.
export default function AreaLocator({ value, onChange, error = null, onEdit }: Props) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestions, setSuggestions] = useState<AreaSearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // -1: 고른 항목 없음 → Enter 는 자유 검색
  const reqId = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(keyword.trim());

  const { result, selectedCode } = value;
  const items = result?.items ?? [];

  // 오류면 입력창·문구가 모두 빨갛게. 장소 없음과 상권 없음은 같은 문구를 쓴다.
  const errorText = status === "noPlace" ? NOT_FOUND : status === "error" ? errorMsg : error;
  const invalid = !!errorText;

  // 자동완성 후보 조회
  useEffect(() => {
    if (!debounced) return;
    let cancelled = false;
    searchAreas(debounced)
      .then((list) => {
        if (cancelled) return;
        setSuggestions(list);
        setActive(-1);
      })
      .catch(() => !cancelled && setSuggestions([]));
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  // 바깥을 누르면 자동완성 닫기
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const showList = open && debounced !== "" && suggestions.length > 0 && status !== "loading";

  const fail = (err: unknown, id: number) => {
    if (id !== reqId.current) return;
    if (err instanceof ApiError && err.status === 404) {
      setStatus("noPlace");
      return;
    }
    setErrorMsg(err instanceof Error ? err.message : "문제가 발생했습니다.");
    setStatus("error");
  };

  // 자동완성에서 상권을 골랐을 때: 코드로 폴리곤을 바로 가져온다
  const selectArea = async (area: AreaSearchItem) => {
    const id = ++reqId.current;
    setKeyword(area.name);
    setOpen(false);
    setStatus("loading");
    onChange({ point: null, result: null, selectedCode: null });
    try {
      const item = await getAreaPolygon(area.code);
      if (id !== reqId.current) return;
      onChange({ point: null, result: { matched: "inside", items: [item] }, selectedCode: item.code });
      setStatus("done");
    } catch (err) {
      fail(err, id);
    }
  };

  // 자유 입력 검색: 카카오 장소검색 → 좌표 → 상권 조회
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    if (!q) return;
    const id = ++reqId.current;
    setOpen(false);
    setStatus("loading");
    onChange({ point: null, result: null, selectedCode: null });
    try {
      const place = await searchPlace(q);
      if (id !== reqId.current) return;
      if (!place) {
        setStatus("noPlace");
        return;
      }
      const data = await locateAreas(place.lat, place.lng);
      if (id !== reqId.current) return;
      onChange({ point: place, result: data, selectedCode: data.items[0]?.code ?? null });
      setStatus("done");
    } catch (err) {
      fail(err, id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") return setOpen(false);
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault(); // 고른 항목이 있으면 폼 제출 대신 그 상권 선택
      selectArea(suggestions[active]);
    }
  };

  return (
    <div ref={wrapperRef} className="w-80 space-y-2">
      <form
        onSubmit={handleSubmit}
        className={`rounded-xl border bg-white p-2 shadow ${invalid ? "border-danger" : "border-transparent"}`}
      >
        <div className="flex items-center gap-2">
          <input
            role="combobox"
            aria-expanded={showList}
            aria-controls="area-suggestions"
            aria-autocomplete="list"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setOpen(true);
              if (status === "noPlace" || status === "error") setStatus("idle");
              onEdit?.();
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="예) 역삼역 3번출구"
            className={`min-w-0 flex-1 bg-transparent px-2 text-sm outline-none ${
              invalid ? "text-danger placeholder:text-danger" : "text-ink-900 placeholder:text-ink-500"
            }`}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            aria-label="검색"
            className="flex size-8 items-center justify-center rounded-lg bg-ink-900 text-white disabled:opacity-60"
          >
            {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          </button>
        </div>
        {invalid && <p className="mt-1 px-2 pb-1 text-sm font-medium text-danger">{errorText}</p>}

        {showList && (
          <ul id="area-suggestions" role="listbox" className="mt-2 border-t border-line pt-1">
            {suggestions.map((a, i) => (
              <li
                key={a.code}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectArea(a);
                }}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm ${
                  i === active ? "bg-surface" : ""
                }`}
              >
                <span className="min-w-0 truncate text-ink-600">
                  <HighlightText text={a.name} keyword={debounced} />
                </span>
                <span className="shrink-0 text-xs text-ink-300">
                  {a.gu} · {a.dong}
                </span>
              </li>
            ))}
          </ul>
        )}
      </form>

      {status === "done" && result && (
        <div className="space-y-2">
          {result.matched === "none" && (
            <Notice>분석 가능한 상권은 아닙니다. 검색한 위치 주변을 표시했습니다</Notice>
          )}
          {result.matched === "nearby" && (
            <Notice>검색한 위치는 상권 안이 아닙니다. 가까운 상권을 함께 보여드립니다</Notice>
          )}

          {/* inside 는 겹칠 때(2개 이상)만 목록, nearby 는 항상 목록 */}
          {items.length > 0 && (result.matched === "nearby" || items.length > 1) && (
            <ul className="overflow-hidden rounded-xl bg-white shadow">
              {items.map((it) => (
                <li key={it.code}>
                  <button
                    type="button"
                    onClick={() => onChange({ ...value, selectedCode: it.code })}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-surface ${
                      it.code === selectedCode ? "bg-surface font-bold" : ""
                    }`}
                  >
                    <span className="text-ink-900">
                      {it.name} <span className="text-ink-500">({it.type_name})</span>
                    </span>
                    {result.matched === "nearby" && (
                      <span className="shrink-0 text-xs text-ink-500">약 {Math.round(it.distance_m ?? 0)}m</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-white px-4 py-2.5 text-sm text-ink-900 shadow">{children}</div>;
}
