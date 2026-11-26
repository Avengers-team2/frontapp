// Lucian UX/UI Prompt #032 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#032
"use client"

import { useRef, useState } from "react";
import { ACCEPT } from "../_lib/reportJob";
import "@/keyframes/form-motion.keyframe.css";

type Props = {
    error: boolean;
    canUpload: boolean;      // 로그인 여부
    onBlocked: () => void;   // 로그인 안 했을 때 (로그인 모달 열기)
    onFile: (file: File) => void;
};

export default function FileDropBox({ error, canUpload, onBlocked, onFile }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    // 파일 선택하기 버튼
    const handlePick = () => {
        if (!canUpload) {
            onBlocked();
            return;
        }
        inputRef.current?.click();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        if (!canUpload) {
            onBlocked();
            return;
        }
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFile(dropped);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        // 안쪽 요소로 이동할 때는 무시
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        if (picked) onFile(picked);
        e.target.value = ""; // 같은 파일 다시 선택 가능하게
    };

    const tone = error ? "bg-[rgba(251,227,228,0.5)]" : dragging ? "bg-[#eaf8f6]" : "bg-[rgba(244,244,244,0.87)]";
    // 점선 테두리: 마우스를 올리거나 파일을 끌고 오면 색이 살아나며 흐른다
    const dash = error
        ? "stroke-[#e5484d] group-hover:animate-[dash-march_.9s_linear_infinite]"
        : dragging
            ? "stroke-[#2bb3a3] animate-[dash-march_.9s_linear_infinite]"
            : "stroke-[#999] group-hover:stroke-[#2bb3a3] group-hover:animate-[dash-march_.9s_linear_infinite]";

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex flex-col items-center h-[357px] rounded-[16px] transition-colors duration-300 ${tone}`}
        >
            <svg aria-hidden className="pointer-events-none absolute left-px top-px h-[calc(100%-2px)] w-[calc(100%-2px)] overflow-visible">
                <rect
                    width="100%"
                    height="100%"
                    rx="15"
                    fill="none"
                    strokeWidth="1.6"
                    strokeDasharray="8 7"
                    className={`transition-[stroke] duration-300 motion-reduce:animate-none ${dash}`}
                />
            </svg>
            {error ? (
                <p className="mt-[78px] text-center text-[30px] font-bold leading-[1.4] text-[#e5484d]">
                    오류가 발생했습니다
                    <br />
                    다시 시도 해주세요
                </p>
            ) : (
                <>
                    <span
                        className={`mt-[61px] flex items-center justify-center w-[56px] h-[56px] rounded-full bg-[#13284a] text-[26px] font-bold text-white transition-transform duration-300 ${
                            dragging ? "-translate-y-[6px]" : ""
                        }`}
                    >
                        ↑
                    </span>
                    <p className="mt-[14px] text-[22px] font-bold leading-[1.4] text-[#1f3a5f]">
                        {dragging ? "여기에 놓으면 올라가요" : "기획서를 여기에 끌어다 놓으세요"}
                    </p>
                </>
            )}

            <p className="mt-[14px] text-center text-[16px] leading-[1.4] text-[#6b6b6b]">
                {error ? "파일을 드래그 하거나 아래 파일 선택하기 버튼을 눌러주세요" : "또는 아래 버튼으로 파일을 선택해 주세요"}
                <br />
                (PDF, DOCX 파일만 · 최대 10MB)
            </p>

            <button
                type="button"
                onClick={handlePick}
                className={`mt-[25px] w-[140px] h-[48px] rounded-full border-[1.2px] bg-white text-[16px] font-semibold cursor-pointer transition-colors duration-300 ${
                    error
                        ? "border-[#e5484d] text-[#e5484d] hover:bg-[#e5484d] hover:text-white"
                        : "border-[#1f3a5f] text-[#1f3a5f] hover:bg-[#1f3a5f] hover:text-white"
                }`}
            >
                파일 선택하기
            </button>

            <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleChange} className="hidden" />
        </div>
    );
}