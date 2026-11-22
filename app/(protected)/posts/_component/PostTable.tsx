import { PostListItem } from "@/types/post/post.type";
import PostRow from "./PostRow";

interface PostTableProps {
    posts?: PostListItem[] | null;
}

// 게시글 목록 (구분 / 제목+댓글 수 / 작성자 / 날짜 / 조회)
export default function PostTable({posts}: PostTableProps) {

    if (!posts || posts.length === 0) {
        return <p className="py-20 text-center text-base text-ink-300">게시글이 없어요.</p>
    }

    // 목록 한 줄씩 PostRow로 렌더링
    const postList = posts.map((post) => (
        <PostRow key={post.post_id} post={post} />
    ));

    return (
        <div className="overflow-hidden rounded-[20px] bg-white">
            {/* 열 제목 */}
            <div className="flex h-17.5 items-center justify-between px-6.75 text-[15px] text-ink-400">
                <div className="flex items-center gap-3.5">
                    <p className="w-26 text-center">구분</p>
                    <p>제목</p>
                </div>
                <div className="flex items-center gap-2.25 text-center">
                    <p className="w-28">작성자</p>
                    <p className="w-14.5">날짜</p>
                    <p className="w-14.5">조회</p>
                </div>
            </div>
            {postList}
        </div>
    );
}
