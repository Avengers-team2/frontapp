"use client";

import { useEffect, useState } from "react";
import {
    getMyAnalyses, MyAnalysisOption, searchPrograms, SearchScope, SupportProgram,
} from "@/api/support/support.api";
import AnalysisFilter from "./AnalysisFilter";
import ProgramCard from "./ProgramCard";
import SearchBar from "./SearchBar";

export default function SupportContainer() {
    const [keyword, setKeyword] = useState("");
    const [scope, setScope] = useState<SearchScope>("all");
    const [analyses, setAnalyses] = useState<MyAnalysisOption[]>([]);
    const [selected, setSelected] = useState<MyAnalysisOption | null>(null);
    const [programs, setPrograms] = useState<SupportProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

    useEffect(() => {
        getMyAnalyses().then(setAnalyses).catch(() => setAnalyses([]));
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        searchPrograms({ keyword, scope, analysis: selected })
            .then((list) => !cancelled && setPrograms(list))
            .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "목록을 불러오지 못했어요."))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [keyword, scope, selected]);

    const toggleBookmark = (key: string) => {
        setBookmarks((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const columns: SupportProgram[][] = [[], [], []];
    programs.forEach((p, i) => columns[i % 3].push(p));

    return (
        <div className="relative min-h-screen overflow-hidden bg-white">
            <div className="pointer-events-none absolute left-1/2 top-20 h-150 w-225 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(94,240,220,0.14),transparent)]" />
            <main className="relative mx-auto w-full max-w-372 px-6 pb-50 pt-50">
                <h1 className="text-center text-5xl font-bold leading-[1.3] text-main">내 사업에 맞는 지원사업을 찾아보세요</h1>

                <div className="mt-15 flex justify-center">
                    <SearchBar
                        onSearch={(k, s) => {
                            setKeyword(k);
                            setScope(s);
                        }}
                    />
                </div>

                <div className="mt-12 flex justify-center">
                    <AnalysisFilter options={analyses} selected={selected} onChange={setSelected} />
                </div>

                <section aria-live="polite" className="mt-30">
                    {loading ? (
                        <p className="py-20 text-center text-[19px] text-ink-400">지원사업을 불러오는 중이에요…</p>
                    ) : error ? (
                        <p className="py-20 text-center text-[19px] text-danger">{error}</p>
                    ) : programs.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-[22px] font-bold text-ink-900">조건에 맞는 지원사업이 없어요</p>
                            <p className="mt-3 text-[19px] text-ink-400">검색어를 바꾸거나 분석 필터를 해제해 보세요.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-x-20">
                            {columns.map((col, c) => (
                                <div key={c} className={`flex flex-col gap-20 ${c === 1 ? "pt-40" : ""}`}>
                                    {col.map((p) => {
                                        const key = `${p.source}:${p.sourceId}`;
                                        return (
                                            <ProgramCard
                                                key={key}
                                                program={p}
                                                bookmarked={bookmarks.has(key)}
                                                onToggleBookmark={() => toggleBookmark(key)}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
