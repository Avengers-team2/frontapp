import type { Analysis } from "@/types/analysis";
import type { AnalysisInsights } from "@/types/analysis-insights";

export type AreaSearchItem = {
    code: string;
    name: string;
    gu: string;
    dong: string;
    center_lat?: number | null;
    center_lng?: number | null;
    has_sales_data?: boolean | null; // false 면 점수 없이 정보판만 나온다. null 이면 서버가 아직 모름
};

// 업종 상태: analyzed 점수 분석 가능 / noRecord 이 상권엔 기록 없음 / unsupported 점수 미지원 (선택은 모두 가능, 정보판이 나온다)
export type IndustryStatus = "analyzed" | "noRecord" | "unsupported";

export type AreaIndustryItem = {
    industryCode: string;
    industryName: string | null;
    status: IndustryStatus;
    // 이 모델 업종에 연결된 우리 업종. small 이 null 이면 중분류 전체
    frontIndustries: { large: string; mid: string; small: string | null }[];
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

export type KakaoPoint = { lat: number; lng: number };

export type AreaLocateItem = {
    code: string;
    name: string;
    type_name: string;
    gu: string;
    dong: string;
    area_m2: number;
    center_lat: number;
    center_lng: number;
    distance_m?: number; // locate 응답에만 있다
    // [폴리곤][고리][점] — 고리의 첫 번째가 바깥 경계, 나머지는 구멍
    kakao_polygons: KakaoPoint[][][];
};

export type AreaLocateResult = {
    matched: "inside" | "nearby" | "none";
    items: AreaLocateItem[];
};

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!BASE_URL) throw new ApiError(0, "NEXT_PUBLIC_BACKEND_URL 이 설정되지 않았어요.");
    const res = await fetch(`${BASE_URL}${path}`, init);
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(res.status, body?.detail ?? body?.message ?? "요청에 실패했어요.");
    return body.data as T;
}

export async function searchAreas(keyword: string): Promise<AreaSearchItem[]> {
    return request<AreaSearchItem[]>(`/analyses/areas?keyword=${encodeURIComponent(keyword)}`);
}

export async function searchBrands(keyword: string): Promise<BrandSearchItem[]> {
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

// 좌표로 상권 폴리곤 조회 (로그인 불필요)
export async function locateAreas(lat: number, lng: number): Promise<AreaLocateResult> {
    return request<AreaLocateResult>(`/analyses/areas/locate?lat=${lat}&lng=${lng}`);
}

// ── 상권 안 점포 (지도 마커 + 경쟁 현황 카드) ──
export type StoreItem = {
    id: string;
    name: string;
    branch: string | null;
    category: string | null;
    floor: string | number | null;
    address: string | null;
    lat: number;
    lng: number;
    is_franchise: boolean; // 프랜차이즈 여부는 서버가 이름 등으로 추정한 값이다
    brand: string | null;
    is_my_brand: boolean; // 사용자가 고른 프랜차이즈 브랜드와 같은 점포
};

export type StoreSummary = {
    total_store_count: number; // 상권 안 모든 업종 점포 수
    same_industry_count: number; // 선택 업종 점포 수 (일반 + 프랜차이즈)
    independent_count: number;
    franchise_count: number;
    first_floor_count: number;
    first_floor_ratio: number | null; // 0~1, 점포가 0개면 null
    same_brand_count: number | null; // brand 를 보냈을 때만 숫자
    model_store_count: number | null; // 모델 기준 분기 점포 수
    model_base_quarter: string | null; // "20254"
    change_vs_model: number | null; // 현재 - 모델 기준
};

export type AreaStores = {
    area_code: string;
    industry_code: string;
    industry_name: string;
    data_month: string; // "202609"
    same_industry_stores: StoreItem[]; // 선택 업종 일반 점포
    franchise_stores: StoreItem[]; // 선택 업종 프랜차이즈 점포 (위와 겹치지 않는다)
    summary: StoreSummary;
    notice: string | null;
};

// 상권 안 점포 조회 (로그인 필요). 처음 부르는 큰 상권은 서버가 외부 API 를 불러서 3~13초 걸릴 수 있다.
// 401 로그인 필요 / 404 없는 상권 / 422 업종을 알 수 없음 / 503 점포 정보를 불러오지 못함
export async function getAreaStores(
    code: string,
    params: { industryCode: string; brand?: string | null },
): Promise<AreaStores> {
    const query = new URLSearchParams({ industry_code: params.industryCode });
    if (params.brand) query.set("brand", params.brand);
    return request<AreaStores>(`/analyses/areas/${encodeURIComponent(code)}/stores?${query}`, {
        credentials: "include",
    });
}

// 분석 결과 화면의 추가 정보 (업종 순위, 매출 추세·예측, 다른 업종 추천, 상권 비교, 프랜차이즈 비중). 로그인 필요.
// 처음 부르면 7초쯤 걸리니 점수 화면을 먼저 그리고 따로 불러온다.
// 401 로그인 필요 / 404 내 분석 조건이 아님 / 422 지원하지 않는 업종 / 503 모델 로드 실패
export async function getAnalysisInsights(inputId: string | number): Promise<AnalysisInsights> {
    return request<AnalysisInsights>(`/analyses/${encodeURIComponent(String(inputId))}/insights`, {
        credentials: "include",
    });
}

// 상권의 업종 목록과 분석 가능 여부 (로그인 불필요)
export async function getAreaIndustries(code: string): Promise<AreaIndustryItem[]> {
    return request<AreaIndustryItem[]>(`/analyses/areas/${encodeURIComponent(code)}/industries`);
}

// 상권 코드로 폴리곤 조회. 없는 코드면 404 (ApiError.status === 404)
export async function getAreaPolygon(code: string): Promise<AreaLocateItem> {
    const data = await request<AreaLocateItem>(`/analyses/areas/${encodeURIComponent(code)}/polygon`);
    return { ...data, code: data.code ?? code };
}

// 분석 실행 (로그인 필요). 같은 조건이면 서버가 저장된 결과를 재사용하므로 다시 불러도 된다.
export async function runAnalysis(inputId: string | number): Promise<Analysis> {
    return request<Analysis>(`/analyses/${encodeURIComponent(String(inputId))}/run`, {
        method: "POST",
        credentials: "include",
    });
}
