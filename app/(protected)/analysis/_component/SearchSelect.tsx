// Lucian UX/UI Prompt #429 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#429
"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import useDebounce from "./useDebounce";

// 자동완성 모션: 목록은 톡 펼쳐지고, 줄은 차례로 내려오고, 선택 막대 한 장이 스프링처럼 미끄러진다
const ROW_SPRING = "cubic-bezier(.3,1.4,.5,1)";
const PILL_SPRING = "cubic-bezier(.3,1.5,.5,1)";
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type SearchSelectProps<T> = {
    placeholder: string;
    disabled?: boolean;
    invalid?: boolean; // 채워야 하는데 비어 있으면 빨간 테두리
    search: (keyword: string) => Promise<T[]>;
    getKey: (item: T) => string;
    getLabel?: (item: T) => string;
    renderItem: (item: T, keyword: string) => React.ReactNode;
    onSelect: (item: T) => void;
    renderEmpty: (keyword: string) => React.ReactNode;
    onKeywordChange?: (keyword: string) => void;
    defaultKeyword?: string;
    openRequest?: { text: string } | null; // 밖에서 검색어를 넣고 목록을 열어 달라는 요청
};

export default function SearchSelect<T>({
    placeholder, disabled, invalid, search, getKey, getLabel, renderItem, onSelect, renderEmpty, onKeywordChange, defaultKeyword = "", openRequest = null,
}: SearchSelectProps<T>) {
    const [keyword, setKeyword] = useState(defaultKeyword);

    // 밖에서 defaultKeyword 가 새 값으로 바뀌면(예: 저장된 입력값 복원) 입력칸 글자도 따라간다.
    // 비워지는 경우는 무시한다 (글자를 지워 가며 입력하는 중일 수 있어서).
    const [prevDefaultKeyword, setPrevDefaultKeyword] = useState(defaultKeyword);
    if (defaultKeyword !== prevDefaultKeyword) {
        setPrevDefaultKeyword(defaultKeyword);
        if (defaultKeyword) setKeyword(defaultKeyword);
    }
    const [results, setResults] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    // 다른 화면에서 주소를 들고 오면 그 글자를 넣고 자동완성 목록을 연다
    const [prevRequest, setPrevRequest] = useState(openRequest);
    if (openRequest !== prevRequest) {
        setPrevRequest(openRequest);
        if (openRequest) {
            setKeyword(openRequest.text);
            setOpen(true);
        }
    }
    const wrapperRef = useRef<HTMLDivElement>(null);
    const chosenLabelRef = useRef<string | null>(null);
    const debouncedKeyword = useDebounce(keyword.trim());

    useEffect(() => {
        if (!debouncedKeyword) {
            setResults([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError("");
        search(debouncedKeyword)
            .then((items) => {
                if (cancelled) return;
                setResults(items);
                setActiveIndex(0);
            })
            .catch((e) => {
                if (cancelled) return;
                setResults([]);
                setError(e instanceof Error ? e.message : "검색 중 문제가 생겼습니다.");
            })
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [debouncedKeyword, search]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const choose = (item: T) => {
        if (getLabel) {
            const label = getLabel(item);
            setKeyword(label);
            chosenLabelRef.current = label;
        }
        onSelect(item);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // 닫힌 목록은 방향키로 다시 연다
        if (!open && results.length > 0 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setOpen(true);
            return;
        }
        if (!open || results.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % results.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i - 1 + results.length) % results.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            choose(results[activeIndex]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const showList = open && debouncedKeyword !== "" && !loading && results.length > 0;
    const showEmpty = open && debouncedKeyword !== "" && !loading && !error && results.length === 0;
    const showError = open && debouncedKeyword !== "" && !loading && error !== "";

    const listId = useId();
    const listRef = useRef<HTMLUListElement>(null);
    const pillRef = useRef<HTMLLIElement>(null);
    const pillAnim = useRef<Animation | null>(null);
    const pillFor = useRef<T[] | null>(null); // 막대가 마지막으로 놓인 목록 (목록이 바뀌면 미끄러지지 않고 바로 놓는다)

    // 목록이 펼쳐지거나 내용이 바뀌면 줄이 위에서부터 차례로 내려온다
    useLayoutEffect(() => {
        if (!showList || reducedMotion()) return;
        listRef.current?.querySelectorAll('[role="option"]').forEach((row, i) =>
            row.animate([{ opacity: 0, translate: "0 -6px" }, { opacity: 1, translate: "0 0" }], {
                duration: 450,
                delay: Math.min(i, 10) * 35,
                easing: ROW_SPRING,
                fill: "backwards",
            }),
        );
    }, [showList, results]);

    // 선택 막대를 고른 줄의 위치·높이로 옮긴다
    useLayoutEffect(() => {
        const pill = pillRef.current;
        const row = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex];
        if (!pill || !row) return;
        const jump = pillFor.current !== results || reducedMotion();
        pillFor.current = results;
        const next = pill.animate([{ translate: `0 ${row.offsetTop}px`, height: `${row.offsetHeight}px` }], {
            duration: jump ? 0 : 450,
            easing: PILL_SPRING,
            fill: "forwards",
        });
        next.finished.then(() => {
            pillAnim.current?.cancel();
            pillAnim.current = next;
        }, () => {});
    }, [activeIndex, results, showList]);

    return (
        <div ref={wrapperRef} className="relative">
            <label
                className={`flex h-[62px] items-center gap-3 rounded-xl border px-5 transition-[color,background-color,border-color,box-shadow] duration-200 ${
                    disabled ? "border-line bg-surface" : invalid ? "border-danger bg-white" : "border-line bg-white focus-within:border-sub focus-within:shadow-[0_0_0_5px_rgba(43,179,163,.14)]"
                }`}
            >
                <span aria-hidden className={`text-[20px] ${disabled ? "text-ink-200" : "text-ink-400"}`}>⌕</span>
                <input
                    role="combobox"
                    aria-expanded={showList}
                    aria-autocomplete="list"
                    aria-controls={listId}
                    aria-activedescendant={showList ? `${listId}-${activeIndex}` : undefined}
                    disabled={disabled}
                    aria-invalid={invalid}
                    value={keyword}
                    placeholder={placeholder}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        onKeywordChange?.(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => keyword !== chosenLabelRef.current && setOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-[20px] text-ink-900 outline-none placeholder:text-ink-200 disabled:cursor-not-allowed"
                />
                {loading && <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-line border-t-sub" />}
            </label>

            {/* 결과 영역: 아래로 부드럽게 펼쳐지고 접힌다. 접히는 동안에도 내용이 남도록 내용은 상태에서 그대로 그린다 */}
            <div
                inert={!(showList || showEmpty || showError)}
                className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.3,1,0.4,1)] motion-reduce:transition-none ${
                    showList || showEmpty || showError ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="-mx-4 min-h-0 overflow-hidden px-4">
                    {results.length > 0 ? (
                        <ul
                            ref={listRef}
                            id={listId}
                            role="listbox"
                            className={`relative mt-2 origin-top overflow-hidden rounded-[14px] border border-line bg-white p-1.5 shadow-[0_22px_44px_-18px_rgba(31,58,95,.3)] transition-[translate,scale] duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none ${
                                showList ? "translate-y-0 scale-100" : "-translate-y-2 scale-[.96]"
                            }`}
                        >
                            <li ref={pillRef} aria-hidden className="pointer-events-none absolute left-1.5 right-1.5 top-0 h-0 rounded-[10px] bg-ink-900/7" />
                            {results.map((item, i) => (
                                <li
                                    key={getKey(item)}
                                    id={`${listId}-${i}`}
                                    role="option"
                                    aria-selected={i === activeIndex}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        choose(item);
                                    }}
                                    className="relative flex cursor-pointer items-center gap-3 rounded-[10px] px-3.5 py-4"
                                >
                                    <div className="min-w-0 flex-1">{renderItem(item, debouncedKeyword)}</div>
                                    <span
                                        aria-hidden
                                        className={`grid size-6 shrink-0 place-items-center rounded-md border border-line-strong text-[12px] text-ink-300 transition-[opacity,scale] duration-300 ease-[cubic-bezier(.34,1.7,.5,1)] motion-reduce:transition-none ${
                                            i === activeIndex ? "scale-100 opacity-100" : "scale-60 opacity-0"
                                        }`}
                                    >
                                        ↵
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : error ? (
                        <div className="mt-2 rounded-xl border border-danger/40 bg-danger-bg px-6 py-5">
                            <p className="text-[17px] font-semibold text-danger-strong">검색 중 문제가 생겼습니다</p>
                            <p className="mt-1 text-[15px] text-ink-500">{error}</p>
                        </div>
                    ) : debouncedKeyword !== "" ? (
                        <div className="mt-2 rounded-xl border border-line bg-white px-6 py-5">{renderEmpty(debouncedKeyword)}</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
