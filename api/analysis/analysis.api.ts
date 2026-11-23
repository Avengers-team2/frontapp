import { AREA_MOCK, BRAND_MOCK } from "./analysis.mock";

export type AreaSearchItem = {
    code: string;
    name: string;
    gu: string;
    dong: string;
};

export type BrandSearchItem = {
    id: string;
    name: string;
    category: string;
    aliasOf?: string;
    disclosureUrl?: string;
};

export type AnalysisInputCreateRequest = {
    trdar_cd: string;
    industry_large: string;
    industry_mid: string;
    industry_small: string;
    deposit_min: number;
    deposit_max: number;
    monthly_rent_max: number | null;
    interior_budget_max: number | null;
    store_size: string | null;
    operating_times: string[];
    target_ages: string[];
    target_gender: string | null;
    business_status: string;
    is_franchise: string | null;
    franchise_brand: string | null;
    extra_note: string | null;
};

type BrandResponse = {
    id: string;
    name: string;
    category: string;
    alias_of: string | null;
    disclosure_url: string | null;
};

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const LIMIT = 8;

const includes = (text: string, keyword: string) =>
    text.replace(/\s/g, "").toLowerCase().includes(keyword.replace(/\s/g, "").toLowerCase());

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!BASE_URL) throw new ApiError(0, "NEXT_PUBLIC_BACKEND_URL 이 설정되지 않았어요.");
    const res = await fetch(`${BASE_URL}${path}`, init);
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, body?.detail ?? body?.message ?? "요청에 실패했어요.");
    return body.data as T;
}

export async function searchAreas(keyword: string): Promise<AreaSearchItem[]> {
    if (USE_MOCK) {
        return AREA_MOCK.filter((a) => includes(`${a.name}${a.gu}${a.dong}`, keyword)).slice(0, LIMIT);
    }
    return request<AreaSearchItem[]>(`/analyses/areas?keyword=${encodeURIComponent(keyword)}`);
}

export async function searchBrands(keyword: string): Promise<BrandSearchItem[]> {
    if (USE_MOCK) {
        return BRAND_MOCK.filter((b) => includes(b.name, keyword)).slice(0, LIMIT);
    }
    const brands = await request<BrandResponse[]>(`/analyses/franchises?keyword=${encodeURIComponent(keyword)}`);
    return brands.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        aliasOf: b.alias_of ?? undefined,
        disclosureUrl: b.disclosure_url ?? undefined,
    }));
}

export async function createAnalysisInput(payload: AnalysisInputCreateRequest): Promise<{ input_id: number }> {
    return request<{ input_id: number }>("/analyses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}
