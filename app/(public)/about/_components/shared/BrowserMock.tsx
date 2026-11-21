"use client"

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

interface BrowserMockProps {
    url: string;            // 주소창 글자
    src: string;            // 화면 캡처 이미지
    imgWidth: number;       // 캡처 원본 크기
    imgHeight: number;
    width: number;          // 브라우저 너비
    viewHeight: number;     // 화면(주소창 아래) 높이
    pillWidth: number;      // 주소창 너비
    pillTop?: number;       // 주소창 위쪽 여백
    shadow?: string;        // 그림자 (배경 색에 따라 다르게)
    duration?: number;      // 끝까지 스크롤되는 시간 (ms)
}

export default function BrowserMock({
    url, src, imgWidth, imgHeight, width, viewHeight, pillWidth,
    pillTop = 5,
    shadow = "shadow-[0_36px_70px_rgba(11,27,51,0.18),0_4px_12px_rgba(11,27,51,0.06)]",
    duration = 14000,
}: BrowserMockProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const animRef = useRef<Animation | null>(null);

    // 실제 이미지 길이에 맞춰 위↔아래 스크롤
    const startScroll = useCallback(() => {
        const img = imgRef.current;
        if (!img) return;
        const distance = img.offsetHeight - viewHeight;
        if (distance <= 0) return;

        animRef.current?.cancel();
        animRef.current = img.animate(
            [{ transform: "translateY(0)" }, { transform: `translateY(-${distance}px)` }],
            { duration, delay: 1000, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }
        );
    }, [viewHeight, duration]);

    useEffect(() => {
        if (imgRef.current?.complete) startScroll();
        return () => animRef.current?.cancel();
    }, [startScroll]);

    return (
        <div
            className={`overflow-hidden rounded-[18px] bg-[#e6ebf1] border-[1px] border-[#d5dce5] ${shadow}`}
            style={{ width, height: viewHeight + 40 }}
        >
            {/* 상단 바 */}
            <div className="relative h-[40px] bg-[#eef2f6]">
                <div className="absolute top-[15px] left-[16px] flex gap-[7px]">
                    <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
                    <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
                    <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
                </div>
                <div
                    className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center h-[30px] rounded-full bg-white border-[1px] border-[#e2e8f0] text-[12px] text-[#5b6577]"
                    style={{ width: pillWidth, top: pillTop }}
                >
                    🔒 {url}
                </div>
            </div>

            {/* 화면: 마우스를 올리면 멈춤 */}
            <div
                className="relative overflow-hidden bg-white"
                style={{ height: viewHeight }}
                onMouseEnter={() => animRef.current?.pause()}
                onMouseLeave={() => animRef.current?.play()}
            >
                <Image
                    ref={imgRef}
                    src={src}
                    alt=""
                    width={imgWidth}
                    height={imgHeight}
                    onLoad={startScroll}
                    className="max-w-none h-auto"
                    style={{ width }}
                />
            </div>
        </div>
    );
}