// Lucian UX/UI Prompt #245 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#245
"use client";

import { useEffect, useRef } from "react";

// 글자 자리마다 무작위 기호가 돌다가 왼쪽부터 제자리를 찾는다. 스크롤해서 화면에 처음 들어왔을 때 한 번만 재생한다.
// 모션 줄이기를 켜면 글자를 그대로 보여준다.

const GLYPH = "!<>-_/[]{}=+~^?#%&@$01";
const DURATION = 1100; // ms (원본의 "보통" 속도)

// 해독 중 기호와 막 확정된 글자의 색
const TONE = {
    light: { glyph: "text-[#2F6BEA]", flash: "group-data-[state=f]/c:text-[#2F6BEA]" },
    dark: { glyph: "text-[#5EF0DC]", flash: "group-data-[state=f]/c:text-[#5EF0DC]" },
} as const;

interface ScrambleTextProps {
    text: string; // 줄바꿈은 \n
    tone?: keyof typeof TONE;
    delay?: number; // 화면에 들어온 뒤 시작까지 (ms)
}

export default function ScrambleText({ text, tone = "light", delay = 0 }: ScrambleTextProps) {
    const rootRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const cells = [...root.querySelectorAll<HTMLElement>("[data-cell]")];
        let frame = 0;
        let wait = 0;
        const flashes: number[] = [];

        const run = () => {
            cancelAnimationFrame(frame);
            const t0 = performance.now();
            // 시작은 무작위, 확정은 왼쪽부터 차례로
            const plan = cells.map((el, i) => {
                el.dataset.state = "z";
                return {
                    el,
                    glyph: el.lastElementChild as HTMLElement,
                    start: Math.random() * DURATION * 0.3,
                    end: DURATION * (0.32 + (0.68 * i) / Math.max(1, cells.length - 1)) + Math.random() * 90,
                    changed: 0,
                    done: false,
                };
            });

            const step = (now: number) => {
                const t = now - t0;
                let left = 0;
                for (const c of plan) {
                    if (c.done) continue;
                    if (t >= c.end) {
                        c.done = true;
                        c.el.dataset.state = "f";
                        flashes.push(window.setTimeout(() => delete c.el.dataset.state, 40));
                        continue;
                    }
                    left += 1;
                    if (t >= c.start) {
                        c.el.dataset.state = "s";
                        if (now - c.changed > 55) {
                            c.changed = now;
                            c.glyph.textContent = GLYPH.charAt((Math.random() * GLYPH.length) | 0);
                        }
                    }
                }
                if (left) frame = requestAnimationFrame(step);
            };
            step(t0);
        };

        const seen = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                seen.disconnect();
                cells.forEach((el) => (el.dataset.state = "z"));
                wait = window.setTimeout(run, delay);
            },
            { threshold: 0.2 },
        );
        seen.observe(root);

        return () => {
            seen.disconnect();
            cancelAnimationFrame(frame);
            window.clearTimeout(wait);
            flashes.forEach(window.clearTimeout);
            cells.forEach((el) => delete el.dataset.state);
        };
    }, [text, delay]);

    const color = TONE[tone];

    return (
        <span ref={rootRef}>
            <span className="sr-only">{text.replace(/\n/g, " ")}</span>
            <span aria-hidden="true">
                {text.split("\n").map((line, l) => (
                    <span key={l} className="block">
                        {line.split(" ").map((word, w) => (
                            <span key={w}>
                                {w > 0 && " "}
                                <span className="whitespace-nowrap">
                                    {Array.from(word).map((ch, i) => (
                                        // 최종 글자(자리 잡기용)와 도는 기호를 겹쳐 두어, 해독 중에도 줄바꿈이 흔들리지 않는다
                                        <span key={i} data-cell className="group/c relative inline-block">
                                            <span className={`group-data-[state=s]/c:invisible group-data-[state=z]/c:invisible ${color.flash}`}>
                                                {ch}
                                            </span>
                                            <span
                                                className={`invisible absolute left-1/2 top-[.08em] -translate-x-1/2 font-mono text-[.82em] font-semibold leading-[1.2] group-data-[state=s]/c:visible ${color.glyph}`}
                                            />
                                        </span>
                                    ))}
                                </span>
                            </span>
                        ))}
                    </span>
                ))}
            </span>
        </span>
    );
}
