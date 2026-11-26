// Lucian UX/UI Prompt #231 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#231
"use client";

import { useEffect, useRef } from "react";

// 뒤로 눕혀진 작은 화면이 스크롤하는 만큼 일어서며 커지고 그림자가 짙어진다. 위로 되돌리면 다시 눕는다.
// 모션 줄이기를 켜면 처음부터 펴진 상태로 둔다.

// 화면 위쪽이 창 높이의 START 지점까지 올라온 뒤에 일어서기 시작해, END 지점에서 다 펴진다.
// (눕혀진 모습이 충분히 보인 다음에 세워지도록 늦게 시작한다)
const START = 0.65;
const END = 0.12;

export default function ScrollTilt({ children }: { children: React.ReactNode }) {
    const trackRef = useRef<HTMLDivElement>(null); // 위치를 재는 칸 (변형하지 않는다)
    const screenRef = useRef<HTMLDivElement>(null); // 기울어지는 화면

    useEffect(() => {
        const track = trackRef.current;
        const screen = screenRef.current;
        if (!track || !screen) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let applied: Animation | null = null;
        let frame = 0;

        const paint = () => {
            frame = 0;
            const top = track.getBoundingClientRect().top;
            const progress = reduce ? 1 : Math.max(0, Math.min(1, (window.innerHeight * START - top) / (window.innerHeight * (START - END))));
            const e = 1 - Math.pow(1 - progress, 2);
            const next = screen.animate(
                [
                    {
                        transform: `perspective(2000px) rotateX(${(34 * (1 - e)).toFixed(2)}deg) scale(${(0.84 + 0.16 * e).toFixed(3)}) translateY(${(18 * (1 - e)).toFixed(1)}px)`,
                        boxShadow: `0 ${(10 + 30 * e).toFixed(1)}px ${(20 + 50 * e).toFixed(1)}px -12px rgba(11,27,51,${(0.18 + 0.2 * e).toFixed(2)})`,
                    },
                ],
                { duration: 0, fill: "forwards" },
            );
            applied?.cancel();
            applied = next;
        };

        const request = () => {
            if (!frame) frame = requestAnimationFrame(paint);
        };

        paint();
        window.addEventListener("scroll", request, { passive: true });
        window.addEventListener("resize", request);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", request);
            window.removeEventListener("resize", request);
            applied?.cancel();
        };
    }, []);

    return (
        <div ref={trackRef}>
            <div ref={screenRef} className="origin-top rounded-[18px] will-change-transform">
                {children}
            </div>
        </div>
    );
}
