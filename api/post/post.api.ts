import { PostCategory, PostSort } from "@/enums/post.enum";
import { ApiResponseDTO } from "@/types/common/common.type";
import {
    PageResponse,
    PostBookmarkStatus,
    PostCreateRequest,
    PostDetail,
    PostLikeStatus,
    PostListItem,
    PostUpdateRequest
} from "@/types/post/post.type";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/post`;

// 게시글 목록 조회 — GET /post
export const getPostsApi = async (params: {
    page: number;
    size: number;
    sort_by: PostSort;
    keyword?: string;
    category?: PostCategory;
}): Promise<ApiResponseDTO<PageResponse<PostListItem>>> => {
    // 값이 있는 것만 쿼리스트링에 넣는다
    const query = new URLSearchParams({
        page: String(params.page),
        size: String(params.size),
        sort_by: params.sort_by,
    });
    if (params.keyword) query.append("keyword", params.keyword);
    if (params.category) query.append("category", params.category);

    const response = await fetch(`${BASE_URL}?${query.toString()}`, {
        credentials: "include"
    });

    if (!response.ok) throw new Error("getPostsApi fetching Error");
    const datas: ApiResponseDTO<PageResponse<PostListItem>> = await response.json();
    return datas;
};

// 게시글 상세 조회 — GET /post/{post_id}
export const getPostDetailApi = async (postId: number): Promise<ApiResponseDTO<PostDetail>> => {
    const response = await fetch(`${BASE_URL}/${postId}`, {
        credentials: "include"
    });

    if (!response.ok) throw new Error("getPostDetailApi fetching Error");
    const datas: ApiResponseDTO<PostDetail> = await response.json();
    return datas;
};

// 내 게시글 목록 조회 — GET /post/me (keyword가 있으면 제목·내용 검색)
export const getMyPostsApi = async (page: number, size: number, keyword?: string): Promise<ApiResponseDTO<PageResponse<PostListItem>>> => {
    const query = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (keyword) query.append("keyword", keyword);

    const response = await fetch(`${BASE_URL}/me?${query.toString()}`, {
        credentials: "include"
    });

    if (!response.ok) throw new Error("getMyPostsApi fetching Error");
    const datas: ApiResponseDTO<PageResponse<PostListItem>> = await response.json();
    return datas;
};

// 게시글 작성 — POST /post
export const createPostApi = async (body: PostCreateRequest): Promise<ApiResponseDTO<{ post_id: number }>> => {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error("createPostApi fetching Error");
    const datas: ApiResponseDTO<{ post_id: number }> = await response.json();
    return datas;
};

// 게시글 수정 — PUT /post/{post_id}
export const updatePostApi = async (postId: number, body: PostUpdateRequest): Promise<ApiResponseDTO<{ post_id: number }>> => {
    const response = await fetch(`${BASE_URL}/${postId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error("updatePostApi fetching Error");
    const datas: ApiResponseDTO<{ post_id: number }> = await response.json();
    return datas;
};

// 게시글 삭제 — DELETE /post/{post_id}
export const deletePostApi = async (postId: number): Promise<ApiResponseDTO> => {
    const response = await fetch(`${BASE_URL}/${postId}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) throw new Error("deletePostApi fetching Error");
    const datas: ApiResponseDTO = await response.json();
    return datas;
};

// 좋아요 토글 — POST /post/{post_id}/like
export const togglePostLikeApi = async (postId: number): Promise<ApiResponseDTO<PostLikeStatus>> => {
    const response = await fetch(`${BASE_URL}/${postId}/like`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) throw new Error("togglePostLikeApi fetching Error");
    const datas: ApiResponseDTO<PostLikeStatus> = await response.json();
    return datas;
};

// 북마크 토글 — POST /post/{post_id}/bookmark
export const togglePostBookmarkApi = async (postId: number): Promise<ApiResponseDTO<PostBookmarkStatus>> => {
    const response = await fetch(`${BASE_URL}/${postId}/bookmark`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) throw new Error("togglePostBookmarkApi fetching Error");
    const datas: ApiResponseDTO<PostBookmarkStatus> = await response.json();
    return datas;
};

// 내 북마크 목록 — GET /post/bookmarks/me
export const getMyBookmarksApi = async (page: number, size: number): Promise<ApiResponseDTO<PageResponse<PostListItem>>> => {
    const response = await fetch(`${BASE_URL}/bookmarks/me?page=${page}&size=${size}`, {
        credentials: "include"
    });

    if (!response.ok) throw new Error("getMyBookmarksApi fetching Error");
    const datas: ApiResponseDTO<PageResponse<PostListItem>> = await response.json();
    return datas;
};