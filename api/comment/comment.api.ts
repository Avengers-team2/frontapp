import { ApiResponseDTO } from "@/types/common/common.type";
import { CommentCreateRequest, CommentUpdateRequest } from "@/types/post/post.type";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/post`;

// 댓글·답글 작성 — POST /post/{post_id}/comments
export const createCommentApi = async (postId: number, body: CommentCreateRequest): Promise<ApiResponseDTO<{ comment_id: number }>> => {
    const response = await fetch(`${BASE_URL}/${postId}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error("createCommentApi fetching Error");
    const datas: ApiResponseDTO<{ comment_id: number }> = await response.json();
    return datas;
};

// 댓글 수정 — PUT /post/comments/{comment_id}
export const updateCommentApi = async (commentId: number, body: CommentUpdateRequest): Promise<ApiResponseDTO<{ comment_id: number }>> => {
    const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error("updateCommentApi fetching Error");
    const datas: ApiResponseDTO<{ comment_id: number }> = await response.json();
    return datas;
};

// 댓글 삭제 — DELETE /post/comments/{comment_id}
export const deleteCommentApi = async (commentId: number): Promise<ApiResponseDTO> => {
    const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include"
    });

    if (!response.ok) throw new Error("deleteCommentApi fetching Error");
    const datas: ApiResponseDTO = await response.json();
    return datas;
};