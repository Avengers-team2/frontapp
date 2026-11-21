import { PostCategory } from "@/enums/post.enum";

// 작성자 요약 정보
export interface UserSummary {
    user_id: number;
    user_nickname: string | null;
}

// 게시글 목록 한 줄
export interface PostListItem {
    post_id: number;
    post_category: PostCategory;
    post_title: string;
    post_view_count: number;
    post_like_count: number;
    post_created_at: string;
    post_comment_count: number;
    user: UserSummary;
}

// 게시글 상세 (목록 항목 + 본문, 댓글 등)
export interface PostDetail extends PostListItem {
    post_content: string;
    post_image_url: string | null;
    post_updated_at: string | null;
    post_deleted_at: string | null;
    is_liked: boolean;
    is_bookmarked: boolean;
    comments: CommentItem[];
}

// 댓글 (대댓글은 children에 담긴다)
export interface CommentItem {
    comment_id: number;
    comment_content: string;
    parent_comment_id: number | null;
    comment_created_at: string;
    comment_updated_at: string | null;
    comment_deleted_at: string | null;
    user: UserSummary;
    children: CommentItem[];
}

// 페이지네이션 응답
export interface PageResponse<T> {
    total_count: number;
    total_pages: number;
    offset: number;
    limit: number;
    items: T[] | null;
}

// 글 작성 요청
export interface PostCreateRequest {
    post_category: PostCategory;
    post_title: string;
    post_content: string;
    post_image_url?: string | null;
}

// 글 수정 요청 (작성 요청과 같은 구조)
export type PostUpdateRequest = PostCreateRequest;

// 좋아요 토글 응답
export interface PostLikeStatus {
    is_liked: boolean;
    post_like_count: number;
}

// 북마크 토글 응답
export interface PostBookmarkStatus {
    is_bookmarked: boolean;
}

// 댓글 작성 요청 (parent_comment_id가 있으면 답글)
export interface CommentCreateRequest {
    comment_content: string;
    parent_comment_id?: number | null;
}

// 댓글 수정 요청
export interface CommentUpdateRequest {
    comment_content: string;
}