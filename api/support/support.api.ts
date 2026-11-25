import { MY_ANALYSIS_MOCK, PROGRAM_MOCK } from "./support.mock";

export type SupportProgram = {
    source: string;
    sourceId: string;
    title: string;
    organization: string | null;
    category: string | null;
    summary: string | null;
    startDate: string | null;
    endDate: string | null;
    tags: string[];
    regions: string[];
    detailUrl: string | null;
};

type SupportProgramResponse = {
    source: string;
    source_id: string;
    title: string;
    organization: string | null;
    category: string | null;
    summary: string | null;
    start_date: string | null;
    end_date: string | null;
    tags: string[];
    regions: string[];
    detail_url: string | null;
};

type MyAnalysisResponse = {
    input_id: number;
    label: string;
    summary: string;
};

export type SearchScope = "all" | "title" | "organization";

export type MyAnalysisOption = {
    inputId: number;
    label: string;
    summary: string;
    keywords?: string[];
};

export type ProgramSearchParams = {
    keyword: string;
    scope: SearchScope;
    analysis?: MyAnalysisOption | null;
};

const USE_MOCK = process.env.NEXT_PUBLIC_SUPPORT_USE_MOCK !== "false";
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const toProgram = (p: SupportProgramResponse): SupportProgram => ({
    source: p.source,
    sourceId: p.source_id,
    title: p.title,
    organization: p.organization,
    category: p.category,
    summary: p.summary,
    startDate: p.start_date,
    endDate: p.end_date,
    tags: p.tags,
    regions: p.regions,
    detailUrl: p.detail_url,
});

const has = (text: string | null, keyword: string) =>
    !!text && text.replace(/\s/g, "").toLowerCase().includes(keyword.replace(/\s/g, "").toLowerCase());

function matchKeyword(p: SupportProgram, keyword: string, scope: SearchScope) {
    if (!keyword.trim()) return true;
    if (scope === "title") return has(p.title, keyword);
    if (scope === "organization") return has(p.organization, keyword);
    return has(p.title, keyword) || has(p.organization, keyword) || has(p.summary, keyword) || p.tags.some((t) => has(t, keyword));
}

function matchAnalysis(p: SupportProgram, analysis?: MyAnalysisOption | null) {
    if (!analysis) return true;
    return (analysis.keywords ?? []).some((k) => p.tags.includes(k) || p.regions.includes(k));
}

export async function searchPrograms({ keyword, scope, analysis }: ProgramSearchParams): Promise<SupportProgram[]> {
    if (USE_MOCK) {
        return PROGRAM_MOCK.filter((p) => matchKeyword(p, keyword, scope) && matchAnalysis(p, analysis));
    }
    const query = new URLSearchParams({ keyword, scope });
    if (analysis) query.set("input_id", String(analysis.inputId));
    const res = await fetch(`${BASE_URL}/support?${query.toString()}`, { credentials: analysis ? "include" : "same-origin" });
    if (res.status === 401) throw new Error("내 분석결과로 보려면 로그인이 필요해요.");
    if (!res.ok) throw new Error("지원사업 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    const list: SupportProgramResponse[] = (await res.json()).data ?? [];
    return list.map(toProgram);
}

export async function getMyAnalyses(): Promise<MyAnalysisOption[]> {
    if (USE_MOCK) return MY_ANALYSIS_MOCK;
    const res = await fetch(`${BASE_URL}/analyses/me`, { credentials: "include" });
    if (!res.ok) return [];
    const list: MyAnalysisResponse[] = (await res.json()).data ?? [];
    return list.map((a) => ({ inputId: a.input_id, label: a.label, summary: a.summary }));
}


type BookmarkStatusResponse = {
    source: string;
    source_id: string;
    is_bookmarked: boolean;
};

export class LoginRequiredError extends Error {
    constructor() {
        super("로그인이 필요해요.");
    }
}

export const SUPPORT_BOOKMARKS_QUERY_KEY = ["support-bookmarks"] as const;

export const bookmarkKey = (source: string, sourceId: string) => `${source}:${sourceId}`;

export async function toggleSupportBookmark(source: string, sourceId: string): Promise<boolean> {
    let res: Response;
    try {
        res = await fetch(`${BASE_URL}/bookmarks/support`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source, source_id: sourceId }),
        });
    } catch {
        throw new LoginRequiredError();
    }
    if (res.status === 401) throw new LoginRequiredError();
    if (!res.ok) throw new Error("관심 지원사업을 저장하지 못했어요.");
    const data: BookmarkStatusResponse = (await res.json()).data;
    return data.is_bookmarked;
}

export async function getMyBookmarkKeys(): Promise<string[]> {
    try {
        const res = await fetch(`${BASE_URL}/bookmarks/support/keys`, { credentials: "include" });
        if (!res.ok) return [];
        return (await res.json()).data ?? [];
    } catch {
        return [];
    }
}
