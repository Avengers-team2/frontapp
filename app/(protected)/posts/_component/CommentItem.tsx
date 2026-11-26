"use client"

import { createCommentApi, deleteCommentApi, updateCommentApi } from "@/api/comment/comment.api";
import { toLoginHref } from "@/lib/loginRedirect";
import useAuthStore from "@/stores/useAuthStore";
import { CommentItem as CommentType } from "@/types/post/post.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CommentForm from "./CommentForm";

interface CommentItemProps {
    comment: CommentType;
    postId: number;
    postAuthorId: number;
}

// 날짜 → "11.04" 형식
const formatDate = (value: string) => {
    const d = new Date(value);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

// 댓글 1개 + 대댓글(children) 재귀 렌더링
export default function CommentItem({comment, postId, postAuthorId}: CommentItemProps) {

    const router = useRouter()
    const queryClient = useQueryClient()
    const user = useAuthStore((state) => state.user)

    // 지금 열려 있는 입력창 (없음 / 답글 / 수정)
    const [mode, setMode] = useState<"none" | "reply" | "edit">("none")

    const isMine = user?.user_id === comment.user.user_id;        // 내 댓글 → 수정·삭제
    const isPostAuthor = comment.user.user_id === postAuthorId;      // 글쓴이 댓글 → 작성자 배지

    // 댓글 변경 후 상세(댓글 목록)·목록(댓글 수) 다시 조회
    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
        queryClient.invalidateQueries({ queryKey: ["posts"] });
    }

    const replyMutation = useMutation({
        mutationFn: (content: string) =>
            createCommentApi(postId, { comment_content: content, parent_comment_id: comment.comment_id }),
        onSuccess: () => { setMode("none"); refresh(); }
    });

    const updateMutation = useMutation({
        mutationFn: (content: string) => updateCommentApi(comment.comment_id, { comment_content: content }),
        onSuccess: () => { setMode("none"); refresh(); }
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteCommentApi(comment.comment_id),
        onSuccess: refresh,
        onError: (err) => console.error(err.message)
    });

    // 답글 버튼 (비로그인이면 로그인 페이지로)
    const handleReplyClick = () => {
        if (!user) return router.push(toLoginHref());
        setMode(mode === "reply" ? "none" : "reply");
    }

    // 삭제 버튼
    const handleDeleteClick = () => {
        if (!window.confirm("댓글을 삭제할까요? 달린 답글도 함께 보이지 않게 됩니다.")) return;
        deleteMutation.mutate();
    }

    return (
        <li>
            <div className="flex flex-col gap-2.25 py-4.5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.25">
                        <span className="text-base font-bold text-ink-900">{comment.user.user_nickname ?? "알 수 없음"}</span>
                        {isPostAuthor && (
                            <span className="rounded-full bg-[#DDF9F4] px-2.75 py-1 text-[15px] font-bold text-sub-700">작성자</span>
                        )}
                        <span className="text-[15px] text-ink-400">
                            {formatDate(comment.comment_created_at)}
                            {comment.comment_updated_at && " (수정됨)"}
                        </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 text-[15px] font-medium text-ink-300">
                        <button type="button" onClick={handleReplyClick}>답글</button>
                        {isMine && (
                            <>
                                <span>·</span>
                                <button type="button" onClick={() => setMode(mode === "edit" ? "none" : "edit")}>수정</button>
                                <span>·</span>
                                <button type="button" onClick={handleDeleteClick}>삭제</button>
                            </>
                        )}
                    </div>
                </div>

                {mode === "edit" ? (
                    <CommentForm
                        initialValue={comment.comment_content}
                        submitLabel="저장"
                        isPending={updateMutation.isPending}
                        onSubmit={async (content) => { await updateMutation.mutateAsync(content); }}
                        onCancel={() => setMode("none")}
                    />
                ) : (
                    <p className="whitespace-pre-wrap text-[17px] leading-[1.65] text-ink-500">{comment.comment_content}</p>
                )}

                {/* 답글 입력창 */}
                {mode === "reply" && (
                    <div className="mt-2 pl-8">
                        <CommentForm
                            placeholder="답글을 남겨 주세요"
                            isPending={replyMutation.isPending}
                            onSubmit={async (content) => { await replyMutation.mutateAsync(content); }}
                            onCancel={() => setMode("none")}
                        />
                    </div>
                )}
            </div>

            {/* 대댓글 (왼쪽으로 들여쓰기) */}
            {comment.children.length > 0 && (
                <ul className="flex flex-col gap-5.5 pl-8">
                    {comment.children.map((child) => (
                        <CommentItem
                            key={child.comment_id}
                            comment={child}
                            postId={postId}
                            postAuthorId={postAuthorId}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}
