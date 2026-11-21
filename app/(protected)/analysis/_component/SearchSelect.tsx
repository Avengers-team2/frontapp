"use client";

import { useEffect, useRef, useState } from "react";
import useDebounce from "./useDebounce";

type SearchSelectProps<T> = {
    placeholder: string;
    disabled?: boolean;
    search: (keyword: string) => Promise<T[]>;
    getKey: (item: T) => string;
    getLabel?: (item: T) => string;
    renderItem: (item: T, keyword: string) => React.ReactNode;
    onSelect: (item: T) => void;
    renderEmpty: (keyword: string) => React.ReactNode;
    onKeywordChange?: (keyword: string) => void;
    defaultKeyword?: string;
};

export default function SearchSelect<T>({
    placeholder, disabled, search, getKey, getLabel, renderItem, onSelect, renderEmpty, onKeywordChange, defaultKeyword = "",
}: SearchSelectProps<T>) {
    const [keyword, setKeyword] = useState(defaultKeyword);
    const [results, setResults] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
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
                setError(e instanceof Error ? e.message : "검색 중 문제가 생겼어요.");
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
                    disabled ? "border-line bg-surface" : "border-line bg-white focus-within:border-sub"
                }`}
            >
                <span aria-hidden className={`text-[20px] ${disabled ? "text-ink-200" : "text-ink-400"}`}>⌕</span>
                <input
                    role="combobox"
                    aria-expanded={showList}
                    aria-autocomplete="list"
                    disabled={disabled}
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

            {showList && (
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
            )}

            {showError && (
                <div className="mt-2 rounded-xl border border-danger/40 bg-danger-bg px-6 py-5">
                    <p className="text-[17px] font-semibold text-danger-strong">검색 중 문제가 생겼어요</p>
                    <p className="mt-1 text-[15px] text-ink-500">{error}</p>
                </div>
            )}

            {showEmpty && (
                <div className="mt-2 rounded-xl border border-line bg-white px-6 py-5">{renderEmpty(debouncedKeyword)}</div>
            )}
        </div>
    );
}
