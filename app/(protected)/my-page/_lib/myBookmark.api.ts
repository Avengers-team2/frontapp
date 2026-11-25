import { ApiResponseDTO } from "@/types/common/common.type";

// 내 관심 지원사업 한 줄 (GET /bookmarks/support/me)
// 공고가 마감돼 정보가 없으면 is_available=false, title은 "공고 정보를 불러올 수 없어요"로 옴
export interface MySupportBookmarkItem {
    bookmark_id: number;
    source: string;
    source_id: string;
    title: string;
    organization: string | null;
    category: string | null;
    start_date: string | null;
    end_date: string | null;
    dday: number | null;
    detail_url: string | null;
    is_available: boolean;
}

export const MY_SUPPORT_BOOKMARKS_QUERY_KEY = "mySupportBookmarks";

// 내 관심 지원사업 목록 — 로그인한 본인 것만 (keyword: 제목·기관 검색)
export const getMySupportBookmarksApi = async (keyword: string = ""): Promise<ApiResponseDTO<MySupportBookmarkItem[]>> => {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/bookmarks/support/me${query}`, {
        credentials: "include"
    });

    if (!response.ok) throw new Error("getMySupportBookmarksApi fetching Error");
    const datas: ApiResponseDTO<MySupportBookmarkItem[]> = await response.json();
    return datas;
};
