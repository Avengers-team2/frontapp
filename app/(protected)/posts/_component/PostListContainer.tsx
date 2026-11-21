"use client"

import { getPostsApi } from "@/api/post/post.api";
import ErrorComponent from "@/components/common/ErrorComponent";
import Loading from "@/components/common/Loading";
import { PostCategory, PostSort } from "@/enums/post.enum";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Pagination from "./Pagination";
import PostCategoryTabs from "./PostCategoryTabs";
import PostSearchBar from "./PostSearchBar";
import PostTable from "./PostTable";

const PAGE_SIZE = 10;

// 게시판 목록 화면 (분류 / 검색 / 정렬 / 페이지 상태 + 부품 배치)
export default function PostListContainer() {

    const [category, setCategory] = useState<PostCategory | undefined>(undefined); // undefined = 전체
    const [keyword, setKeyword] = useState<string>("");
    const [sort, setSort] = useState<PostSort>(PostSort.LATEST);
    const [page, setPage] = useState<number>(1);

    // 목록 조회 (조건이 바뀌면 queryKey가 바뀌어 다시 조회)
    const { data, isLoading, error } = useQuery({
        queryKey: ["posts", page, sort, keyword, category],
        queryFn: () => getPostsApi({
            page,
            size: PAGE_SIZE,
            sort_by: sort,
            keyword: keyword || undefined,
            category
        }),
        placeholderData: keepPreviousData // 페이지 넘길 때 이전 목록 유지 (깜빡임 방지)
    });

    const pageData = data?.data;

    // 분류 탭 클릭 → 해당 분류로 필터, 1페이지로 이동
    const handleCategoryClick = (next?: PostCategory) => {
        setCategory(next);
        setPage(1);
    }

    // 검색 (엔터 시) → 1페이지로 이동
    const handleKeywordChange = (next: string) => {
        setKeyword(next);
        setPage(1);
    }

    // 정렬 변경
    const handleSortChange = (next: PostSort) => {
        setSort(next);
        setPage(1);
    }

    // 페이지 번호 클릭
    const handlePageChange = (next: number) => {
        setPage(next);
    }

    return (
        <main className="mx-auto w-full max-w-372 px-6 pb-50 pt-43">
            {/* 제목 영역 */}
            <section className="border-b border-ink-900 pb-7.5">
                <p className="text-lg leading-[1.6] text-ink-400">홈 › 게시판</p>
                <h1 className="mt-3 text-5xl font-bold leading-[1.3] text-ink-900">게시판</h1>
                <p className="mt-3 text-[19px] text-ink-400">창업을 준비하는 분, 가게를 운영하는 사장님이 경험을 나누는 곳이에요.</p>
            </section>

            {/* 분류 탭 + 검색 / 정렬 / 글쓰기 */}
            <div className="mt-12 flex min-h-15 flex-wrap items-center justify-between gap-4">
                <PostCategoryTabs category={category} onCategoryClick={handleCategoryClick} />
                <PostSearchBar
                    keyword={keyword}
                    sort={sort}
                    onKeywordChange={handleKeywordChange}
                    onSortChange={handleSortChange}
                />
            </div>

            {/* 목록 */}
            <div className="mt-4.5">
                {isLoading ? <Loading /> : error ? <ErrorComponent /> : <PostTable posts={pageData?.items} />}
            </div>

            <Pagination page={page} totalPages={pageData?.total_pages} onPageChange={handlePageChange} />
        </main>
    );
}
