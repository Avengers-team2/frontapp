"use client"

import { SubmitEvent, useState } from "react";

interface CommentFormProps {
    initialValue?: string;
    placeholder?: string;
    submitLabel?: string;
    isPending?: boolean;
    onSubmit: (content: string) => Promise<void>;
    onCancel?: () => void;
}

// 댓글 입력 폼 (새 댓글 / 답글 / 댓글 수정 공용)
export default function CommentForm({
    initialValue = "",
    placeholder = "댓글을 남겨 주세요",
    submitLabel = "등록",
    isPending,
    onSubmit,
    onCancel
}: CommentFormProps) {

    const [value, setValue] = useState(initialValue);

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const content = value.trim();
        if (!content) return;

        try {
            await onSubmit(content);
            setValue(""); // 성공했을 때만 입력창 비우기
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2.75">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="min-w-0 flex-1 rounded-xl border border-[#CFE9E4] bg-white px-4.5 py-3.5 text-base text-ink-900 placeholder:text-[#9AA4B2] focus:border-sub focus:outline-none"
            />
            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="shrink-0 rounded-full border border-line bg-white px-5 py-3 text-base font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
                >
                    취소
                </button>
            )}
            <button
                type="submit"
                disabled={isPending || !value.trim()}
                className="shrink-0 rounded-full bg-main-dark px-5 py-3 text-base font-bold text-white disabled:opacity-40"
            >
                {submitLabel}
            </button>
        </form>
    );
}
