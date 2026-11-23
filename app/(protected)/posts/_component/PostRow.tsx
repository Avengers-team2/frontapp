import { PostCategory } from "@/enums/post.enum";
import { PostListItem } from "@/types/post/post.type";
import Link from "next/link";
import PostCategoryBadge from "./PostCategoryBadge";

interface PostRowProps {
    post: PostListItem;
}

// 날짜 → "11.04" 형식
const formatDate = (value: string) => {
    const d = new Date(value);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${month}.${day}`;
}

// 게시글 목록 한 줄 (줄 전체 클릭 → 상세)
export default function PostRow({post}: PostRowProps) {
    const isNotice = post.post_category === PostCategory.NOTICE;

    return (
        <Link href={`/posts/${post.post_id}`} className="flex items-center justify-between gap-4 px-6.75 py-5">
            <div className="flex min-w-0 items-center gap-3.5">
                <div className="flex w-26 shrink-0 justify-center">
                    <PostCategoryBadge category={post.post_category} />
                </div>
                <p className={`truncate text-[17px] text-ink-900 ${isNotice ? "font-semibold" : "font-medium"}`}>
                    {post.post_title}
                </p>
                {post.post_comment_count > 0 && (
                    <span className="shrink-0 text-[15px] font-bold text-sub-700">{post.post_comment_count}</span>
                )}
            </div>
            <div className="flex shrink-0 items-center gap-2.25 text-center text-[15px] text-ink-300">
                <p className="w-28 truncate">{post.user.user_nickname ?? "알 수 없음"}</p>
                <p className="w-14.5">{formatDate(post.post_created_at)}</p>
                <p className="w-14.5">{post.post_view_count.toLocaleString()}</p>
            </div>
        </Link>
    );
}
