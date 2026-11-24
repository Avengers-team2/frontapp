"use client"

import { useEffect, useState } from "react";
import { useInView } from "./Reveal";

type Props = {
    score: number;
};

const RING = 330;   // 링 지름
const STROKE = 26;  // 링 두께
const R = (RING - STROKE) / 2;
const FILL_DURATION = 2200; // 링이 차오르는 시간
const FILL_DELAY = 500;     // 위젯이 떠오른 뒤 링이 시작되기까지

// 링 모양으로 자르는 마스크
const RING_MASK = `radial-gradient(farthest-side, transparent calc(100% - ${STROKE}px), #000 calc(100% - ${STROKE}px))`;

// 주변에 떠 있는 점 (게이지 박스 기준 위치)
const PARTICLES = [
    { left: 3, top: 88, size: 14, delay: "0s" },
    { left: 400, top: 60, size: 10, delay: "-1.2s" },
    { left: 436, top: 266, size: 18, delay: "-2.4s" },
    { left: -25, top: 300, size: 10, delay: "-3.1s" },
];

// 링 주변 별 (게이지 박스 기준)
const OUTER_STARS = [
    { left: 92, top: 96, size: 18, delay: "0s" },
    { left: 322, top: 84, size: 14, delay: "-0.7s" },
    { left: 350, top: 318, size: 20, delay: "-1.4s" },
    { left: 70, top: 300, size: 12, delay: "-2.1s" },
];

// 구슬 안쪽 별 (구슬 기준)
const INNER_STARS = [
    { left: 38, top: 72, size: 10, delay: "-0.4s" },
    { left: 172, top: 58, size: 8, delay: "-1.1s" },
    { left: 168, top: 150, size: 12, delay: "-1.8s" },
];

// 네 갈래 별 모양
function Star({ size, color }: { size: number; color: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" fill={color} />
        </svg>
    );
}

export default function ScoreGauge({ score }: Props) {
    const { ref, inView } = useInView<HTMLDivElement>(0.35);
    const [value, setValue] = useState(0);
    const [done, setDone] = useState(false); // 다 차오르면 반짝임 시작

    // 화면에 들어오면 0 → score 로 천천히 차오름
    useEffect(() => {
        if (!inView) return;
        let raf = 0;

        const timer = setTimeout(() => {
            const start = performance.now();
            const tick = (now: number) => {
                const t = Math.min((now - start) / FILL_DURATION, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                setValue(score * eased);
                if (t < 1) raf = requestAnimationFrame(tick);
                else setDone(true);
            };
            raf = requestAnimationFrame(tick);
        }, FILL_DELAY);

        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(raf);
        };
    }, [inView, score]);

    // 링 끝 동그라미 위치
    const angle = (value / 100) * Math.PI * 2 - Math.PI / 2;
    const headX = RING / 2 + R * Math.cos(angle);
    const headY = RING / 2 + R * Math.sin(angle);

    return (
        <div
            ref={ref}
            className={`relative w-[430px] h-[430px] mx-auto transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-[60px] scale-[0.94]"
            }`}
        >
            <style>{`
                @keyframes report-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes report-glow {
                    0%, 100% { opacity: 0.35; transform: scale(0.9); }
                    50% { opacity: 0.85; transform: scale(1.1); }
                }
                @keyframes report-shine {
                    0% { transform: translateX(-180%) rotate(22deg); }
                    45%, 100% { transform: translateX(320%) rotate(22deg); }
                }
                @keyframes report-twinkle {
                    0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
                    50% { opacity: 1; transform: scale(1) rotate(45deg); }
                }
            `}</style>

            {/* 은은한 빛 */}
            <div
                className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(94,240,220,0.18) 0%, rgba(94,240,220,0.06) 45%, transparent 70%)" }}
            />

            {/* 떠 있는 점 */}
            {PARTICLES.map((p, i) => (
                <span
                    key={i}
                    className="absolute rounded-full bg-[#5ef0dc]/80 animate-[report-float_4s_ease-in-out_infinite] motion-reduce:animate-none"
                    style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: p.delay }}
                />
            ))}

            {/* 링 주변 별 반짝임 */}
            {done &&
                OUTER_STARS.map((s, i) => (
                    <span
                        key={i}
                        className="absolute z-10 opacity-0 animate-[report-twinkle_2.4s_ease-in-out_infinite] motion-reduce:hidden"
                        style={{ left: s.left, top: s.top, animationDelay: s.delay }}
                    >
                        <Star size={s.size} color="#5ef0dc" />
                    </span>
                ))}

            {/* 링 영역 */}
            <div className="absolute top-[50px] left-[50px] w-[330px] h-[330px]">
                {/* 링 안쪽 바탕 */}
                <div className="absolute inset-[26px] rounded-full bg-[#f0fbf9]" />

                {/* 링 트랙 */}
                <div
                    className="absolute inset-0 rounded-full bg-[#e6f5f2]"
                    style={{ WebkitMask: RING_MASK, mask: RING_MASK }}
                />

                {/* 링 진행 (민트 → 네이비 → 민트) */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background:
                            "conic-gradient(from 0deg, #5ef0dc 0%, #2bb3a3 20%, #1d5466 33%, #13284a 40%, #1d6f6a 50%, #2bb3a3 60%, #4fd8c4 72%, #5ef0dc 100%)",
                        WebkitMask: `conic-gradient(#000 ${value}%, transparent 0), ${RING_MASK}`,
                        WebkitMaskComposite: "source-in",
                        mask: `conic-gradient(#000 ${value}%, transparent 0), ${RING_MASK}`,
                        maskComposite: "intersect",
                    }}
                />

                {/* 링 끝 동그라미 */}
                {value > 0.5 && (
                    <span
                        className="absolute w-[28px] h-[28px] rounded-full bg-white border-[4px] border-[#2bb3a3] shadow-[0_2px_8px_rgba(11,27,51,0.2)]"
                        style={{ left: headX - 14, top: headY - 14 }}
                    />
                )}

                {/* 가운데 유리 구슬 */}
                <div
                    className="absolute top-[53px] left-[53px] w-[224px] h-[224px] rounded-full overflow-hidden flex flex-col items-center justify-center shadow-[0_20px_40px_rgba(11,27,51,0.35)]"
                    style={{ background: "radial-gradient(circle at 45% 40%, #1f5f63 0%, #123a48 45%, #0c1a2c 100%)" }}
                >
                    {/* 숫자 뒤 빛 (숨 쉬듯 커졌다 작아짐) */}
                    {done && (
                        <span
                            className="absolute w-[170px] h-[170px] rounded-full animate-[report-glow_2.8s_ease-in-out_infinite] motion-reduce:animate-none"
                            style={{ background: "radial-gradient(circle, rgba(94,240,220,0.45) 0%, rgba(94,240,220,0.12) 45%, transparent 70%)" }}
                        />
                    )}

                    {/* 유리 광택 빛줄기 */}
                    {done && (
                        <span
                            className="absolute top-[-40px] left-0 w-[60px] h-[300px] animate-[report-shine_3.2s_ease-in-out_infinite] motion-reduce:hidden"
                            style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.22), transparent)" }}
                        />
                    )}

                    {/* 구슬 안쪽 별 */}
                    {done &&
                        INNER_STARS.map((s, i) => (
                            <span
                                key={i}
                                className="absolute opacity-0 animate-[report-twinkle_2s_ease-in-out_infinite] motion-reduce:hidden"
                                style={{ left: s.left, top: s.top, animationDelay: s.delay }}
                            >
                                <Star size={s.size} color="#ffffff" />
                            </span>
                        ))}

                    {/* 유리 반사광 */}
                    <span
                        className="absolute top-[12px] left-[34px] w-[70px] h-[34px] rounded-full -rotate-[18deg]"
                        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0))" }}
                    />

                    {/* 점수 */}
                    <p
                        className={`relative font-(family-name:--font-outfit) text-[90px] font-semibold leading-none text-white tabular-nums transition-[text-shadow] duration-700 ${
                            done ? "[text-shadow:0_0_24px_rgba(94,240,220,0.55)]" : ""
                        }`}
                    >
                        {Math.round(value)}
                    </p>
                    <p className="relative mt-[16px] text-[15px] font-medium text-white/80">종합 점수 · 100점 기준</p>
                </div>
            </div>
        </div>
    );
}