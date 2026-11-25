"use client";

import { useEffect, useRef, useState } from "react";
import type { MyAnalysisOption } from "@/api/support/support.api";

type AnalysisFilterProps = {
    options: MyAnalysisOption[];
    selected: MyAnalysisOption | null;
    onChange: (option: MyAnalysisOption | null) => void;
};

export default function AnalysisFilter({ options, selected, onChange }: AnalysisFilterProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const disabled = options.length === 0;

    return (
        <div ref={ref} className="relative w-111">
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={`flex h-15 w-full items-center justify-between rounded-full border-[1.5px] bg-white pl-7 pr-6 text-[17px] shadow-[0px_4px_14px_0px_rgba(43,179,163,0.08)] transition-colors ${
                    open ? "border-sub" : "border-[#CFE9E4]"
                } disabled:cursor-not-allowed disabled:text-ink-300`}
            >
                <span className={`truncate ${selected ? "font-semibold text-ink-900" : "text-ink-700"}`}>
                    {disabled ? "분석 결과가 있으면 맞춤 공고를 볼 수 있어요" : selected ? `${selected.label} · ${selected.summary}` : "내 분석결과에 맞는 지원사업 보기"}
                </span>
                <span className={`ml-3 text-xs text-ink-700 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
            </button>

            {open && (
                <ul role="listbox" className="absolute left-0 right-0 top-18 z-20 flex flex-col gap-1 rounded-2xl border border-line bg-white p-3 shadow-[0px_10px_30px_0px_rgba(11,27,51,0.12)]">
                    {options.map((o) => {
                        const isSelected = selected?.inputId === o.inputId;
                        return (
                            <li key={o.inputId}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        onChange(isSelected ? null : o);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-xl px-6 py-4 text-left ${
                                        isSelected ? "bg-sub-50" : "hover:bg-surface"
                                    }`}
                                >
                                    <span>
                                        <span className={`block text-[17px] ${isSelected ? "font-bold text-sub-700" : "text-ink-700"}`}>{o.label}</span>
                                        <span className="mt-1 block text-[15px] text-ink-400">{o.summary}</span>
                                    </span>
                                    {isSelected && <span className="text-[19px] text-sub-700">✓</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
