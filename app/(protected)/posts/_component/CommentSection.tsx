"use client"

import { createCommentApi } from "@/api/comment/comment.api";
import useAuthStore from "@/stores/useAuthStore";
import { CommentItem as CommentType } from "@/types/post/post.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
    postId: number;
    postAuthorId: number;
    comments?: CommentType[] | null;
    commentCount: number;
}

const VISIBLE_COUNT = 3; // 처음에 보여줄 댓글(최상위) 개수

// 댓글 트리 안의 댓글 수 (답글 포함)
const countTree = (nodes: CommentType[]): number =>
    nodes.reduce((sum, node) => sum + 1 + countTree(node.children), 0);

// 댓글 입력 + 댓글 목록 + 더 보기
export default function CommentSection({postId, postAuthorId, comments, commentCount}: CommentSectionProps) {

    const router = useRouter()
    const queryClient = useQueryClient()
    const user = useAuthStore((state) => state.user)
    const [showAll, setShowAll] = useState(false)

    // 댓글 작성
    const createMutation = useMutation({
        mutationFn: (content: string) => createCommentApi(postId, { comment_content: content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });

    const handleCreate = async (content: string) => {
        if (!user) {
            router.push("/login");
            throw new Error("로그인이 필요합니다.");
        }
        await createMutation.mutateAsync(content);
    }

    const list = comments ?? [];
    const visible = showAll ? list : list.slice(0, VISIBLE_COUNT);
    const hiddenCount = commentCount - countTree(visible);

    return (
        <section className="mt-12.5 flex flex-col gap-5.5 py-9">
            <h2 className="text-[19px] font-bold text-ink-900">댓글 {commentCount}</h2>

            <CommentForm onSubmit={handleCreate} isPending={createMutation.isPending} />

            {list.length === 0 ? (
                <p className="text-base text-ink-300">첫 댓글을 남겨 보세요.</p>
            ) : (
                <ul className="flex flex-col gap-5.5">
                    {visible.map((comment) => (
                        <CommentItem
                            key={comment.comment_id}
                            comment={comment}
                            postId={postId}
                            postAuthorId={postAuthorId}
                        />
                    ))}
                </ul>
            )}

            {!showAll && hiddenCount > 0 && (
                <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="self-start whitespace-pre text-base font-medium text-ink-300"
                >
                    {`댓글 ${hiddenCount}개 더 보기  ▾`}
                </button>
            )}
        </section>
    );
}
