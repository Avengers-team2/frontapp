import { ApiResponseDTO } from "@/types/common/common.type";

// 내 분석 조건 목록 한 줄 (GET /analyses/me, 최근 10개까지만 옴)
// TODO: 분석 담당자가 api/analysis/analysis.api.ts에 같은 함수를 만들면 그걸로 교체
export interface MyAnalysisItem {
    input_id: number;
    label: string;   // 예: "신사동 가로수길 · 커피 전문점"
    summary: string; // 예: "강남구 · 커피 전문점 · 창업 준비"
}

// 내 분석 목록 — 로그인한 본인 것만
export const getMyAnalysesApi = async (): Promise<ApiResponseDTO<MyAnalysisItem[]>> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analyses/me`, {
        credentials: "include"
    });

    if (!response.ok) throw new Error("getMyAnalysesApi fetching Error");
    const datas: ApiResponseDTO<MyAnalysisItem[]> = await response.json();
    return datas;
};
