// ERD: posts, post_comments, post_like, post_bookmark
export interface Post {
  post_id: number;
  user_id: number;
  post_category: string;
  post_title: string;
  post_content: string;
  post_image_url: string | null;
  post_view_count: number;
  post_like_count: number;
  post_created_at: string;
  post_updated_at: string | null;
  post_deleted_at: string | null;
}

export interface PostComment {
  comment_id: number;
  user_id: number;
  post_id: number;
  parent_comment_id: number | null; // 대댓글이면 부모 댓글 id
  comment_content: string;
  comment_created_at: string;
  comment_updated_at: string | null;
  comment_deleted_at: string | null;
}

export interface PostLike {
  like_id: number;
  post_id: number;
  user_id: number;
  like_created_at: string;
}

export interface PostBookmark {
  bookmark_id: number;
  user_id: number;
  post_id: number;
  bookmark_created_at: string;
}
