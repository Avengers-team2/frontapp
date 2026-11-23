"use client"

import { createPostApi, getPostDetailApi, updatePostApi } from "@/api/post/post.api";
import Loading from "@/components/common/Loading";
import { PostCategoryLabel, PostWritableCategories } from "@/enums/post.enum";
import { PostCreateRequest } from "@/types/post/post.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import AnalysisAttachSelect from "./AnalysisAttachSelect";
import PostEditorToolbar from "./PostEditorToolbar";

interface PostFormProps {
    mode: "create" | "edit";
    params?: Promise<{id: string}>; // 수정 모드일 때만 사용 (page.tsx에서 받은 params)
}

const MAX_CONTENT = 5000; // 내용 최대 글자 수
const MAX_TITLE = 200;    // 제목 최대 글자 수 (백엔드 String(200))

// 글쓰기 / 글 수정 공용 폼 (주제 / 제목 / 내용 / 취소 · 등록)
export default function PostForm({mode, params}: PostFormProps) {

    const id = params ? use(params).id : undefined; // Suspense 안에서 글 번호 꺼내기
    const isEdit = mode === "edit";
    const postId = Number(id);
    const router = useRouter()
    const queryClient = useQueryClient()

    const {
        register, handleSubmit, reset, setValue, control,
        formState: {
            isSubmitting, errors
        }
    } = useForm<PostCreateRequest>({mode: "onChange"})

    // 수정 모드: 기존 글 불러오기 (상세와 같은 queryKey → 캐시가 있으면 재사용)
    const { data: detail, isLoading } = useQuery({
        queryKey: ["post", postId],
        queryFn: () => getPostDetailApi(postId),
        enabled: isEdit
    });

    // 불러온 값으로 폼 채우기
    useEffect(() => {
        const post = detail?.data;
        if (!isEdit || !post) return;
        reset({
            post_category: post.post_category,
            post_title: post.post_title,
            post_content: post.post_content,
            post_image_url: post.post_image_url
        });
    }, [detail, isEdit, reset]);

    // 작성 / 수정 저장
    const saveMutation = useMutation({
        mutationFn: (body: PostCreateRequest) => isEdit ? updatePostApi(postId, body) : createPostApi(body),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            if (isEdit) queryClient.invalidateQueries({ queryKey: ["post", postId] });
            const savedId = res.data?.post_id;
            router.push(savedId ? `/posts/${savedId}` : "/posts");
        },
        onError: (err) => console.error(err.message)
    });

    const onSubmit = async (body: PostCreateRequest) => {
        try {
            await saveMutation.mutateAsync(body);
        } catch {
            // onError에서 처리
        }
    }

    // 취소 버튼 클릭 → 이전 페이지로
    const handleCancelClick = () => {
        router.back()
    }

    // 분석 결과 첨부 선택값 (화면만, 아직 백엔드로 보내지 않음)
    const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);

    // ===== 내용 서식 버튼 =====
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const { ref: contentFieldRef, ...contentField } = register("post_content", { required: true, validate: (v) => v.trim().length > 0 });

    // 바뀐 내용을 폼에 넣고, 커서(선택 영역)를 다시 맞춰 주기
    const applyContent = (next: string, selectStart: number, selectEnd: number) => {
        if (next.length > MAX_CONTENT) return; // 5,000자 넘으면 적용 안 함
        setValue("post_content", next, { shouldValidate: true, shouldDirty: true });
        requestAnimationFrame(() => {
            const ta = textareaRef.current;
            if (!ta) return;
            ta.focus();
            ta.setSelectionRange(selectStart, selectEnd);
        });
    }

    // 선택한 글자 양옆에 기호 붙이기 (선택이 없으면 예시 글자 넣기)
    const wrapSelection = (marker: string, placeholder: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const { selectionStart: start, selectionEnd: end, value } = ta;
        const selected = value.slice(start, end) || placeholder;
        const next = value.slice(0, start) + marker + selected + marker + value.slice(end);
        applyContent(next, start + marker.length, start + marker.length + selected.length);
    }

    // 선택한 줄(또는 커서가 있는 줄) 앞에 "- " 붙이기
    const handleList = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        const { selectionStart: start, selectionEnd: end, value } = ta;
        const lineStart = value.lastIndexOf("\n", start - 1) + 1;
        const lineEndIndex = value.indexOf("\n", end);
        const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
        const block = value.slice(lineStart, lineEnd)
            .split("\n")
            .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
            .join("\n");
        const next = value.slice(0, lineStart) + block + value.slice(lineEnd);
        applyContent(next, lineStart, lineStart + block.length);
    }

    // 링크 넣기: [텍스트](주소)
    const handleLink = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        const url = window.prompt("링크 주소를 입력하세요.", "https://");
        if (!url) return;
        if (!/^https?:\/\/\S+$/.test(url.trim())) {
            window.alert("http:// 또는 https:// 로 시작하는 주소만 넣을 수 있어요.");
            return;
        }
        const { selectionStart: start, selectionEnd: end, value } = ta;
        const label = value.slice(start, end) || "링크";
        const inserted = `[${label}](${url.trim()})`;
        const next = value.slice(0, start) + inserted + value.slice(end);
        applyContent(next, start + inserted.length, start + inserted.length);
    }

    const selectedCategory = useWatch({ control, name: "post_category" });
    const contentLength = useWatch({ control, name: "post_content" })?.length ?? 0;

    if (isEdit && isLoading) return <Loading />

    const labelClass = "flex items-center gap-1 text-base font-bold text-ink-900";
    const required = <span className="text-[#E5533D]">*</span>;
    const errorClass = "mt-1.5 text-sm text-[#E5533D]";

    return (
        <main className="mx-auto w-full max-w-372 px-6 pb-50 pt-43">
            <section className="border-b border-ink-900 pb-14">
                <p className="text-lg leading-[1.6] text-ink-400">홈 › 게시판 › {isEdit ? "글 수정" : "글쓰기"}</p>
                <h1 className="mt-3 text-5xl font-bold leading-[1.3] text-ink-900">{isEdit ? "글 수정" : "글쓰기"}</h1>
            </section>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-14.5 flex flex-col gap-7.25 rounded-[20px] bg-white p-10">
                {/* 주제 */}
                <div>
                    <p className={labelClass}>주제 {required}</p>
                    <input type="hidden" {...register("post_category", { required: true })} />
                    <div className="mt-2.75 flex flex-wrap items-center gap-2.25">
                        {PostWritableCategories.map((category) => {
                            const isActive = selectedCategory === category;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setValue("post_category", category, { shouldValidate: true })}
                                    className={`rounded-full px-4.5 py-2.5 text-base ${
                                        isActive
                                            ? "bg-main-dark font-bold text-white"
                                            : "border border-line bg-white font-medium text-ink-500"
                                    }`}
                                >
                                    {PostCategoryLabel[category]}
                                </button>
                            );
                        })}
                    </div>
                    {errors?.post_category && <p className={errorClass}>주제를 선택해 주세요.</p>}
                </div>

                {/* 제목 */}
                <label className="block">
                    <p className={labelClass}>제목 {required}</p>
                    <input
                        type="text"
                        placeholder="제목을 입력하세요."
                        maxLength={MAX_TITLE}
                        {...register("post_title", { required: true, validate: (v) => v.trim().length > 0 })}
                        className="mt-2.75 w-full rounded-xl border border-[#CFE9E4] bg-white px-4.5 py-3.5 text-[17px] text-ink-900 placeholder:text-[#9AA4B2] focus:border-sub focus:outline-none"
                    />
                    {errors?.post_title && <p className={errorClass}>제목을 입력해 주세요.</p>}
                </label>

                {/* 내용 (서식 버튼이 있어서 label 대신 div) */}
                <div>
                    <p className={labelClass}>내용 {required}</p>
                    <div className="mt-2.75 flex h-106.5 flex-col overflow-hidden rounded-xl border border-[#CFE9E4] bg-white focus-within:border-sub">
                        <PostEditorToolbar
                            onBold={() => wrapSelection("**", "굵은 글씨")}
                            onItalic={() => wrapSelection("*", "기울인 글씨")}
                            onUnderline={() => wrapSelection("__", "밑줄 글씨")}
                            onList={handleList}
                            onLink={handleLink}
                            onImage={() => window.alert("사진 업로드는 준비 중이에요.")} // S3 업로드 연결 전
                        />
                        <textarea
                            placeholder="내용을 입력하세요."
                            maxLength={MAX_CONTENT}
                            {...contentField}
                            ref={(el) => {
                                contentFieldRef(el);
                                textareaRef.current = el;
                            }}
                            className="block w-full flex-1 resize-none overflow-y-auto p-5 text-[17px] leading-[1.75] text-ink-500 placeholder:text-[#9AA4B2] focus:outline-none"
                        />
                        <p className="pb-3.5 pr-4.5 text-right text-base text-ink-300">
                            {contentLength.toLocaleString()} / {MAX_CONTENT.toLocaleString()}자
                        </p>
                    </div>
                    {errors?.post_content && <p className={errorClass}>내용을 입력해 주세요.</p>}
                </div>

                {/* 분석 결과 첨부 (선택) — 프론트 화면만 */}
                <AnalysisAttachSelect selectedId={selectedAnalysisId} onSelect={setSelectedAnalysisId} />

                {/* 취소 / 등록 */}
                <div className="flex items-center justify-end gap-2.75">
                    <button
                        type="button"
                        onClick={handleCancelClick}
                        className="rounded-full border border-line bg-white px-5 py-3 text-base font-semibold text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || saveMutation.isPending}
                        className="rounded-full bg-main-dark px-5 py-3 text-base font-bold text-white disabled:opacity-40"
                    >
                        {isEdit ? "수정하기" : "등록하기"}
                    </button>
                </div>
            </form>
        </main>
    );
}
