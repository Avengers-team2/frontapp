// Lucian UX/UI Prompt #419 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#419
"use client";

import { ReactNode, useEffect, useRef } from "react";

// 화면에 들어오면 순서대로 떠오른다. 처음 한 번만 재생하고, 모션 줄이기를 켜면 바로 보여준다.
//  - Rise      : 글·버튼 덩어리가 살짝(10px) 떠오르며 나타난다
//  - RiseTitle : 제목이 단어마다 가림막 아래에서 솟아오른다

// 화면에 들어왔을 때 한 번 실행
function useOnSeen<T extends HTMLElement>(play: (el: T) => Animation[]) {
    const ref = useRef<T>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let running: Animation[] = [];
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                running = play(el);
            },
            { threshold: 0.2 },
        );
        observer.observe(el);
        return () => {
            observer.disconnect();
            running.forEach((a) => a.cancel());
        };
        // 처음 마운트 때의 설정으로 한 번만 재생한다
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ref;
}

export function Rise({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
    const ref = useOnSeen<HTMLDivElement>((el) => [
        el.animate(
            [
                { opacity: 0, translate: "0 10px" },
                { opacity: 1, translate: "0 0" },
            ],
            { duration: 800, delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
        ),
    ]);

    return (
        <div ref={ref} className={`opacity-0 motion-reduce:opacity-100 ${className}`}>
            {children}
        </div>
    );
}

export interface TitlePart {
    text: string; // 띄어쓰기 단위로 나눠 솟아오른다
    className?: string;
}

// lines: 줄마다 조각 목록. 색이 다른 부분은 조각을 나눠 className 을 준다
export function RiseTitle({ lines, delay = 150 }: { lines: TitlePart[][]; delay?: number }) {
    const ref = useOnSeen<HTMLSpanElement>((el) =>
        [...el.querySelectorAll<HTMLElement>("[data-word]")].map((word, i) =>
            word.animate(
                [
                    { translate: "0 105%", rotate: "4deg" },
                    { translate: "0 0", rotate: "0deg" },
                ],
                { duration: 900, delay: delay + i * 80, easing: "cubic-bezier(.25,1.35,.45,1)", fill: "both" },
            ),
        ),
    );

    return (
        <span ref={ref} className="block">
            <span className="sr-only">{lines.map((parts) => parts.map((p) => p.text).join("")).join(" ")}</span>
            <span aria-hidden="true">
                {lines.map((parts, l) => (
                    <span key={l} className="block">
                        {parts.map((part, p) =>
                            part.text.split(/(\s+)/).map((token, t) =>
                                token.trim() === "" ? (
                                    token && <span key={`${p}-${t}`}> </span>
                                ) : (
                                    <span key={`${p}-${t}`} className="-mb-[.08em] inline-block overflow-hidden px-[.02em] pb-[.08em] align-top">
                                        <span
                                            data-word
                                            className={`inline-block origin-bottom-left translate-y-[105%] rotate-[4deg] motion-reduce:translate-y-0 motion-reduce:rotate-0 ${part.className ?? ""}`}
                                        >
                                            {token}
                                        </span>
                                    </span>
                                ),
                            ),
                        )}
                    </span>
                ))}
            </span>
        </span>
    );
}
