"use client";

import { useEffect, useRef, useState } from "react";
import useDebounce from "./useDebounce";

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

    return (
        <div ref={wrapperRef} className="relative">
            <label
                className={`flex h-[62px] items-center gap-3 rounded-xl border px-5 transition-colors ${
                    disabled ? "border-line bg-surface" : invalid ? "border-danger bg-white" : "border-line bg-white focus-within:border-sub"
                }`}
            >
                <span aria-hidden className={`text-[20px] ${disabled ? "text-ink-200" : "text-ink-400"}`}>⌕</span>
                <input
                    role="combobox"
                    aria-expanded={showList}
                    aria-autocomplete="list"
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
                <div className="min-h-0 overflow-hidden">
                    {results.length > 0 ? (
                        <ul role="listbox" className="mt-2 overflow-hidden rounded-xl border border-line bg-white">
                            {results.map((item, i) => (
                                <li
                                    key={getKey(item)}
                                    role="option"
                                    aria-selected={i === activeIndex}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        choose(item);
                                    }}
                                    className={`cursor-pointer border-b border-line px-5 py-4 last:border-b-0 ${
                                        i === activeIndex ? "bg-surface" : "bg-white"
                                    }`}
                                >
                                    {renderItem(item, debouncedKeyword)}
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
