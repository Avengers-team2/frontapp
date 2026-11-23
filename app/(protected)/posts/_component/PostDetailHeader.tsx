import { PostDetail } from "@/types/post/post.type";
import PostCategoryBadge from "./PostCategoryBadge";

interface PostDetailHeaderProps {
    post: PostDetail;
    isOwner: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

// 날짜 → "2026.11.04 14:20" 형식
const formatDateTime = (value: string) => {
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 상세 헤더 (작성자 / 작성일시 / 조회 / 댓글 수 / 분류 배지 / 수정·삭제 버튼 / 제목)
export default function PostDetailHeader({post, isOwner, onEdit, onDelete}: PostDetailHeaderProps) {
    const buttonClass = "rounded-full border border-line bg-white px-5 py-2 text-[15px] font-semibold shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]";

    return (
        <div className="rounded-xl border border-[#CFE9E4] bg-white px-5 pb-7 pt-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="size-11.25 shrink-0 rounded-full bg-sub" />
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[17px] font-bold text-ink-900">{post.user.user_nickname ?? "알 수 없음"}</p>
                        <p className="whitespace-pre text-[15px] text-ink-400">
                            {`${formatDateTime(post.post_created_at)}  ·  조회 ${post.post_view_count.toLocaleString()}  ·  댓글 ${post.post_comment_count}`}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2.25 pt-1.25">
                    <PostCategoryBadge category={post.post_category} size="md" />
                    {isOwner && (
                        <>
                            <button type="button" onClick={onEdit} className={`${buttonClass} text-ink-700`}>수정</button>
                            <button type="button" onClick={onDelete} className={`${buttonClass} text-[#E5533D]`}>삭제</button>
                        </>
                    )}
                </div>
            </div>

            <h1 className="mt-8.5 text-3xl font-bold text-ink-900">{post.post_title}</h1>
        </div>
    );
}
