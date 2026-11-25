"use client"

import { deletePostApi, getPostDetailApi, togglePostBookmarkApi, togglePostLikeApi } from "@/api/post/post.api";
import ErrorComponent from "@/components/common/ErrorComponent";
import Loading from "@/components/common/Loading";
import { PostCategoryLabel } from "@/enums/post.enum";
import useAuthStore from "@/stores/useAuthStore";
import { ApiResponseDTO } from "@/types/common/common.type";
import { PostDetail } from "@/types/post/post.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import CommentSection from "./CommentSection";
import LikeButton from "./LikeButton";
import PostContent from "./PostContent";
import PostDetailHeader from "./PostDetailHeader";

interface PostDetailContainerProps {
    params: Promise<{id: string}>; // page.tsx에서 받은 params를 그대로 받음
}

// 게시글 상세 화면 (헤더 / 본문 / 공감·북마크·공유 / 댓글)
export default function PostDetailContainer({params}: PostDetailContainerProps) {

    const { id } = use(params); // Suspense 안에서 글 번호 꺼내기
    const postId = Number(id);
    const router = useRouter()
    const queryClient = useQueryClient()
    const user = useAuthStore((state) => state.user)
    const [copied, setCopied] = useState(false)

    // 상세 조회
    const { data, isLoading, error } = useQuery({
        queryKey: ["post", postId],
        queryFn: () => getPostDetailApi(postId)
    });
    const post = data?.data ?? undefined;

    // 상세 캐시의 일부 값만 바꾸기 (좋아요·북마크 후 다시 조회하지 않도록 → 조회수 안 올라감)
    const updateDetailCache = (patch: Partial<PostDetail>) => {
        queryClient.setQueryData<ApiResponseDTO<PostDetail>>(["post", postId], (prev) =>
            prev?.data ? { ...prev, data: { ...prev.data, ...patch } } : prev
        );
    }

    // 삭제
    const deleteMutation = useMutation({
        mutationFn: () => deletePostApi(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            router.push("/posts");
        },
        onError: (err) => console.error(err.message)
    });

    // 좋아요 토글
    const likeMutation = useMutation({
        mutationFn: () => togglePostLikeApi(postId),
        onSuccess: (res) => {
            if (!res.data) return;
            updateDetailCache({ is_liked: res.data.is_liked, post_like_count: res.data.post_like_count });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (err) => console.error(err.message)
    });

    // 북마크 토글
    const bookmarkMutation = useMutation({
        mutationFn: () => togglePostBookmarkApi(postId),
        onSuccess: (res) => {
            if (!res.data) return;
            updateDetailCache({ is_bookmarked: res.data.is_bookmarked });
        },
        onError: (err) => console.error(err.message)
    });

    if(isLoading) return <Loading />
    if(error || !post) return <ErrorComponent />

    // 로그인한 사람이 글쓴이인지 (수정·삭제 버튼 노출)
    const isOwner = user?.user_id === post.user.user_id;

    // 수정 버튼 클릭 → 수정 페이지 이동
    const handleEditClick = () => {
        router.push(`/posts/${id}/edit`)
    }

    // 삭제 버튼 클릭
    const handleDeleteClick = () => {
        if (!window.confirm("게시글을 삭제할까요?")) return;
        deleteMutation.mutate();
    }

    // 공감(좋아요) 버튼 클릭 (비로그인이면 로그인 페이지로)
    const handleLikeClick = () => {
        if (!user) return router.push("/login");
        likeMutation.mutate();
    }

    // 북마크 버튼 클릭 (비로그인이면 로그인 페이지로)
    const handleBookmarkClick = () => {
        if (!user) return router.push("/login");
        bookmarkMutation.mutate();
    }

    // 공유 버튼 클릭 → 현재 주소 복사
    const handleShareClick = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error(err);
        }
    }

    const pillClass = "whitespace-pre rounded-full border border-line bg-white px-5 py-3 text-[15px] font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]";

    return (
        <main className="mx-auto w-full max-w-372 px-6 pb-50 pt-43">
            <section className="border-b border-ink-900 pb-6.5">
                <p className="text-lg leading-[1.6] text-ink-400">홈 › 게시판 › {PostCategoryLabel[post.post_category]}</p>
            </section>

            <Link href="/posts" className="mt-11 inline-block whitespace-pre text-base font-medium text-ink-500">{"←  목록으로"}</Link>

            <article className="mt-15.75 px-10.5">
                <PostDetailHeader
                    post={post}
                    isOwner={isOwner}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />

                {/* 본문 */}
                <div className="mt-11.25 p-5.25 text-lg leading-[1.75] text-ink-500">
                    <PostContent content={post.post_content} />
                </div>

                {/* 첨부 사진 (순서대로) */}
                {post.images?.length > 0 && (
                    <div className="mt-6 flex flex-col items-start gap-4 px-5.25">
                        {post.images.map((image) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={image.image_id} src={image.image_url} alt={`첨부 이미지 ${image.image_sort_order + 1}`} className="max-h-120 rounded-xl" />
                        ))}
                    </div>
                )}

                {/* 공감 / 북마크 / 공유 */}
                <div className="mt-6.75 flex items-center gap-2.75">
                    <LikeButton
                        likeCount={post.post_like_count}
                        isLiked={post.is_liked}
                        disabled={likeMutation.isPending}
                        onLike={handleLikeClick}
                    />
                    <button type="button" onClick={handleBookmarkClick} disabled={bookmarkMutation.isPending} className={pillClass}>
                        {post.is_bookmarked ? "북마크됨" : "북마크"}
                    </button>
                    <button type="button" onClick={handleShareClick} className={pillClass}>
                        {copied ? "링크 복사됨" : "공유"}
                    </button>
                </div>

                <CommentSection
                    postId={postId}
                    postAuthorId={post.user.user_id}
                    comments={post.comments}
                    commentCount={post.post_comment_count}
                />
            </article>
        </main>
    );
}
