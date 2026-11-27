"use client"

import { createPostApi, getPostDetailApi, updatePostApi } from "@/api/post/post.api";
import { uploadImageApi } from "@/api/upload/upload.api";
import Loading from "@/components/common/Loading";
import { PostCategoryLabel, PostWritableCategories } from "@/enums/post.enum";
import { PostCreateRequest } from "@/types/post/post.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
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
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 사진 최대 5MB (백엔드와 같음)
const MAX_IMAGES = 10;                  // 게시글당 사진 최대 장수 (백엔드와 같음)

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
            post_image_urls: post.images.map((image) => image.image_url)
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
            // 사진을 안 건드렸어도 항상 목록을 보냄 (수정 때 빠지면 백엔드가 사진을 전부 지움)
            await saveMutation.mutateAsync({ ...body, post_image_urls: body.post_image_urls ?? [] });
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

    // ===== 사진 업로드 (게시글당 최대 10장) =====
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadingCount, setUploadingCount] = useState(0); // 올리는 중인 사진 수
    const isUploading = uploadingCount > 0;
    const watchedImageUrls = useWatch({ control, name: "post_image_urls" });
    const imageUrls = watchedImageUrls ?? [];

    // 사진 버튼 클릭 → 파일 선택창 열기 (10장이 차 있으면 안내만)
    const handleImageClick = () => {
        if (imageUrls.length >= MAX_IMAGES) {
            window.alert(`사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`);
            return;
        }
        fileInputRef.current?.click();
    }

    // 파일 하나를 S3에 올리고 주소 받기
    const uploadOne = async (file: File): Promise<string> => {
        const res = await uploadImageApi(file, "post");
        const url = res.data?.originalUrl ?? res.data?.original_url;
        if (!url) throw new Error("업로드 주소를 받지 못했어요.");
        return url;
    }

    // 여러 장 고르면 검사 → S3에 올리고, 받은 주소를 post_image_urls 뒤에 붙이기 (고른 순서 유지)
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = ""; // 같은 파일 다시 골라도 동작하게 비움
        if (files.length === 0) return;

        const current = imageUrls;
        const remain = MAX_IMAGES - current.length;
        const notImage = files.filter((file) => !file.type.startsWith("image/"));
        const tooBig = files.filter((file) => file.type.startsWith("image/") && file.size > MAX_IMAGE_SIZE);
        const valid = files.filter((file) => file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE);
        const targets = valid.slice(0, remain);

        const messages: string[] = [];
        if (notImage.length > 0) messages.push(`이미지가 아닌 파일 ${notImage.length}개는 뺐어요.`);
        if (tooBig.length > 0) messages.push(`5MB가 넘는 사진 ${tooBig.length}장은 뺐어요.`);
        if (valid.length > remain) messages.push(`사진은 최대 ${MAX_IMAGES}장이라 ${valid.length - remain}장은 뺐어요.`);
        if (messages.length > 0) window.alert(messages.join("\n"));
        if (targets.length === 0) return;

        setUploadingCount(targets.length);
        const results = await Promise.allSettled(targets.map(uploadOne));
        setUploadingCount(0);

        const uploaded = results
            .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
            .map((r) => r.value);
        const failedCount = results.length - uploaded.length;
        if (failedCount > 0) window.alert(`사진 ${failedCount}장은 업로드에 실패했어요.`);

        if (uploaded.length > 0) {
            setValue("post_image_urls", [...current, ...uploaded].slice(0, MAX_IMAGES), { shouldDirty: true });
        }
    }

    // 첨부한 사진 한 장 빼기 (S3 파일은 그대로 두고 글에서만 뺌)
    const handleImageRemove = (index: number) => {
        setValue("post_image_urls", imageUrls.filter((_, i) => i !== index), { shouldDirty: true });
    }

    const selectedCategory = useWatch({ control, name: "post_category" });
    const contentValue = useWatch({ control, name: "post_content" });
    const hasImages = imageUrls.length > 0 || isUploading; // 사진이 있으면 글 칸은 글 길이만큼만 (사진이 글 바로 아래 오게)
    const contentLength = contentValue?.length ?? 0;

    // 내용이 바뀔 때마다(입력·서식 버튼·수정 모드 불러오기) textarea 높이를 글 길이에 맞추기
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${ta.scrollHeight}px`;
    }, [contentValue, hasImages]);

    if (isEdit && isLoading) return <Loading />

    const labelClass = "flex items-center gap-1 text-base font-bold text-ink-900";
    const required = <span className="text-[#E5533D]">*</span>;
    const errorClass = "mt-1.5 text-sm text-[#E5533D]";

    return (
        <main className="mx-auto w-[90%] max-w-[1440px] pb-50 pt-43">
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
                    <div className="mt-2.75 flex min-h-106.5 flex-col overflow-hidden rounded-xl border border-[#CFE9E4] bg-white focus-within:border-sub">
                        <PostEditorToolbar
                            onBold={() => wrapSelection("**", "굵은 글씨")}
                            onItalic={() => wrapSelection("*", "기울인 글씨")}
                            onUnderline={() => wrapSelection("__", "밑줄 글씨")}
                            onList={handleList}
                            onLink={handleLink}
                            onImage={handleImageClick}
                        />
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                        <textarea
                            placeholder="내용을 입력하세요."
                            maxLength={MAX_CONTENT}
                            {...contentField}
                            ref={(el) => {
                                contentFieldRef(el);
                                textareaRef.current = el;
                            }}
                            rows={1}
                            className={`block w-full resize-none overflow-hidden p-5 text-[17px] leading-[1.75] text-ink-500 placeholder:text-[#9AA4B2] focus:outline-none ${hasImages ? "" : "min-h-60 flex-1"}`}
                        />
                        {/* 첨부 사진 미리보기 (최대 10장) */}
                        {hasImages && (
                            <div className="shrink-0 px-5 pb-3">
                                <p className="text-sm text-ink-400">
                                    사진 {imageUrls.length} / {MAX_IMAGES}장
                                    {isUploading && ` · ${uploadingCount}장 올리는 중...`}
                                </p>
                                <div className="mt-2 flex flex-col gap-3">
                                    {imageUrls.map((url, index) => (
                                        <div key={`${url}-${index}`} className="group relative w-fit max-w-full">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`첨부 사진 ${index + 1}`} className="block h-auto max-w-full rounded-xl border border-line" />
                                            <button
                                                type="button"
                                                onClick={() => handleImageRemove(index)}
                                                title="사진 빼기"
                                                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-ink-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                        disabled={isSubmitting || saveMutation.isPending || isUploading}
                        className="rounded-full bg-main-dark px-5 py-3 text-base font-bold text-white disabled:opacity-40"
                    >
                        {isEdit ? "수정하기" : "등록하기"}
                    </button>
                </div>
            </form>
        </main>
    );
}
