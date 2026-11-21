"use client"

import { PostCategoryLabel } from "@/enums/post.enum";
import Link from "next/link";
import { useState } from "react";
import Pagination from "../../posts/_component/Pagination";
import MyPageListHeader from "./MyPageListHeader";
import { MOCK_MY_POSTS } from "./mockData";

const PAGE_SIZE = 10;

// 내가 쓴 글 — 마이페이지 목록 스타일
// TODO: 지금은 가짜 데이터. 로그인 연결 후 getMyPostsApi(page, size) (GET /post/me)로 바꾸기
export default function MyPostList() {
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");

    const filtered = MOCK_MY_POSTS.filter((post) => post.post_title.includes(keyword));
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const posts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // 검색하면 1페이지로
    const handleSearch = (next: string) => {
        setKeyword(next);
        setPage(1);
    }

    return (
        <section>
            <MyPageListHeader total={filtered.length} placeholder="내가 쓴 글을 검색해 주세요" onSearch={handleSearch} />

            <div className="mt-6 h-0.5 bg-sub" />

            {posts.length === 0 ? (
                <p className="py-20 text-center text-lg text-ink-300">작성한 글이 없어요.</p>
            ) : (
                <ul>
                    {posts.map((post) => (
                        <li key={post.post_id} className="border-b border-line-light">
                            <Link href={`/posts/${post.post_id}`} className="flex items-center justify-between py-6 pl-4.5 pr-7.5">
                                <span className="flex min-w-0 items-center gap-4">
                                    <span className="flex h-9 shrink-0 items-center rounded-full bg-surface px-4 text-base font-medium text-ink-500">
                                        {PostCategoryLabel[post.post_category]}
                                    </span>
                                    <span className="truncate text-xl font-medium text-ink-900">{post.post_title}</span>
                                    {post.post_comment_count > 0 && (
                                        <span className="flex h-7.5 shrink-0 items-center rounded-full bg-sub-50 px-2.5 text-[15px] font-bold text-sub-700">
                                            댓글 {post.post_comment_count}
                                        </span>
                                    )}
                                </span>
                                <span className="shrink-0 text-base text-ink-300">{post.post_created_at}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </section>
    );
}
