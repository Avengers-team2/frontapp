// Lucian UX/UI Prompt #001 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#001
"use client";

import { useEffect, useRef } from "react";
import "@/keyframes/form-motion.keyframe.css";

// 납작한 유리 캡슐 모양의 제출 버튼.
// idle: 캡슐 / load: 물방울처럼 줄어들어 로딩 / ok: 완료 체크와 함께 다시 펼쳐짐

export type LiquidState = "idle" | "load" | "ok";

const SPRING = "cubic-bezier(.34,1.45,.64,1)";

const BUTTON_BASE =
    "group pointer-events-auto relative isolate ml-auto block h-[72px] cursor-pointer overflow-hidden rounded-full border-0 backdrop-blur-md backdrop-saturate-150 " +
    "motion-reduce:[transition:none] " +
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sub";

// 길이가 바뀔 때는 살짝 넘쳤다가 돌아오는 탄성, 로딩 동그라미로 줄어들 때는 빠르게
const MOVE_SPRING =
    "[transition:width_.35s_cubic-bezier(.34,1.3,.64,1),margin_.35s_cubic-bezier(.34,1.3,.64,1),scale_.55s_cubic-bezier(.34,1.45,.64,1),box-shadow_.3s,color_.3s]";
const MOVE_QUICK =
    "[transition:width_.3s_cubic-bezier(.2,.8,.2,1),margin_.3s_cubic-bezier(.2,.8,.2,1),box-shadow_.3s,color_.3s]";

// 유리: 반투명한 #13284A → #1D5466 → #2BB3A3 그라데이션 + 안쪽 광택, 화면에 떠 있으므로 아래로 은은한 그림자
const GLASS =
    "text-white bg-[linear-gradient(90deg,rgba(19,40,74,.85),rgba(29,84,102,.85)_50%,rgba(43,179,163,.85))] " +
    "shadow-[inset_0_1.5px_0_rgba(255,255,255,.35),inset_0_-10px_16px_-12px_rgba(255,255,255,.5),0_10px_24px_-8px_rgba(31,58,95,.35),0_2px_10px_rgba(0,0,0,.1)]";
// 유리 뒤에 비치는 색 번짐
const BLOB =
    "absolute rounded-full blur-[16px] animate-[liquid-drift_12s_ease-in-out_infinite_alternate] motion-reduce:animate-none";

const LAYER =
    "absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap text-[16px] font-semibold tracking-tight " +
    "transition-[opacity,translate,filter] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none";

interface LiquidSubmitButtonProps {
    state: LiquidState;
    disabled: boolean;
    label: string;
    doneLabel: string;
    expanded: boolean; // true 면 컨텐츠 영역 가로를 꽉 채운다
}

export default function LiquidSubmitButton({ state, disabled, label, doneLabel, expanded }: LiquidSubmitButtonProps) {
    // 꽉 찬 상태에서 로딩이 되면 가운데로 모인다
    const width =
        state === "load" ? `w-[72px] ${expanded ? "mr-[calc(50%-36px)]" : "mr-0"}` : `mr-0 ${expanded ? "w-full" : "w-[220px]"}`;
    const move = state === "load" ? MOVE_QUICK : MOVE_SPRING;
    const press = expanded ? "enabled:active:scale-[1.005_0.92]" : "enabled:active:scale-[1.03_0.92]";
    const cursor = state === "load" ? "disabled:cursor-progress" : "disabled:cursor-default";

    const magnetRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const glowRef = useRef<HTMLSpanElement>(null);
    const bounceRef = useRef<HTMLDivElement>(null);
    const wasExpanded = useRef(expanded);

    // 길이가 바뀌는 순간 위아래로 뽀용 하고 눌렸다 돌아온다
    useEffect(() => {
        if (wasExpanded.current === expanded) return;
        wasExpanded.current = expanded;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        bounceRef.current?.animate(
            [{ scale: "1 1" }, { scale: "1 .86" }, { scale: "1 1.1" }, { scale: "1 .97" }, { scale: "1 1" }],
            { duration: 380, easing: "ease-out" },
        );
    }, [expanded]);

    // 커서가 가까워지면 버튼이 살짝 끌려오고, 빛 반사가 커서를 따라간다.
    // 주변 영역이 뒤의 입력칸 클릭을 막지 않도록 창 전체에서 커서 위치를 받는다
    useEffect(() => {
        if (disabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let pulled = false;
        const move = (x: number, y: number) => {
            magnetRef.current?.animate([{ translate: `${x}px ${y}px` }], { duration: 800, easing: SPRING, fill: "forwards" });
        };
        const release = () => {
            if (!pulled) return;
            pulled = false;
            move(0, 0);
        };
        const onPointerMove = (e: PointerEvent) => {
            const button = buttonRef.current;
            if (!button) return;
            const r = button.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            // 긴 버튼은 중심이 아니라 가로 범위 밖으로 벗어난 거리로 가까움을 잰다
            const awayX = expanded ? Math.max(0, Math.abs(dx) - r.width / 2) : dx;
            const pull = Math.max(0, 1 - Math.hypot(awayX, dy) / 190);
            if (pull === 0) return release();
            pulled = true;
            // 긴 버튼은 좌우로 최대 10px 만 움직인다
            move(expanded ? (dx / (r.width / 2)) * 10 * pull : dx * 0.18 * pull, dy * 0.18 * pull);
            glowRef.current?.animate([{ translate: `${e.clientX - r.left}px ${e.clientY - r.top}px` }], {
                duration: 0,
                fill: "forwards",
            });
        };
        window.addEventListener("pointermove", onPointerMove);
        document.documentElement.addEventListener("pointerleave", release);
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            document.documentElement.removeEventListener("pointerleave", release);
            release();
        };
    }, [disabled, expanded]);

    return (
        <div className="relative isolate w-full">
            <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-y-0 right-0 -z-10 transition-[width] duration-300 motion-reduce:transition-none ${expanded ? "w-full" : "w-[220px]"}`}
                >
                    <i className={`${BLOB} left-[8%] top-1 h-10 w-[40%] bg-main/30`} />
                    <i className={`${BLOB} bottom-0 right-[8%] h-10 w-[45%] bg-sub/45 [animation-delay:-4s]`} />
                    <i className={`${BLOB} left-1/2 top-0 size-10 bg-mint/40 [animation-delay:-8s]`} />
                </div>

            <div ref={magnetRef}>
                <div ref={bounceRef} className={expanded ? "" : "animate-[liquid-float_6s_ease-in-out_infinite] motion-reduce:animate-none"}>
                    <button
                        ref={buttonRef}
                        type="submit"
                        disabled={disabled}
                        aria-busy={state === "load"}
                        aria-label={state === "idle" ? label : state === "load" ? "분석 요청 중" : doneLabel}
                        className={`${BUTTON_BASE} ${move} ${press} ${width} ${GLASS} ${cursor}`}
                    >
                        {/* 위쪽 광택 */}
                        <span aria-hidden className="pointer-events-none absolute left-[9%] right-[9%] top-[7%] h-[42%] rounded-full bg-linear-to-b from-white/20 to-white/0" />
                        {/* 커서를 따라가는 빛 */}
                        <span
                            ref={glowRef}
                            aria-hidden
                            className="pointer-events-none absolute -left-[130px] -top-[70px] h-[140px] w-[260px] bg-[radial-gradient(closest-side,rgba(255,255,255,.3),transparent)] opacity-0 transition-opacity duration-400 group-enabled:group-hover:opacity-100"
                        />
                        {/* 호버하면 지나가는 빛줄기 */}
                        <span
                            aria-hidden
                            className="pointer-events-none absolute -bottom-[40%] -top-[40%] left-0 w-[38%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,.35)_50%,transparent)] [transform:translateX(-150%)_skewX(-12deg)] [transition:transform_1.1s_cubic-bezier(.2,.8,.2,1)] group-enabled:group-hover:[transform:translateX(300%)_skewX(-12deg)] motion-reduce:hidden"
                        />

                        <span className={`${LAYER} ${state === "idle" ? "" : "-translate-y-3.5 opacity-0 blur-[5px]"}`}>{label}</span>

                        <span
                            aria-hidden
                            className={`absolute left-1/2 top-1/2 -ml-3 -mt-3 size-6 transition-[opacity,scale] duration-500 ease-[cubic-bezier(.34,1.45,.64,1)] ${state === "load" ? "opacity-100" : "scale-50 opacity-0"}`}
                        >
                            <svg viewBox="0 0 30 30" className="size-full animate-spin fill-none stroke-current stroke-[2.4]">
                                <circle
                                    cx="15"
                                    cy="15"
                                    r="10"
                                    strokeLinecap="round"
                                    className="animate-[liquid-arc_1.4s_ease-in-out_infinite]"
                                />
                            </svg>
                        </span>

                        <span aria-hidden className={`${LAYER} ${state === "ok" ? "" : "translate-y-3.5 opacity-0 blur-[4px]"}`}>
                            <b className="grid size-6 place-items-center rounded-full bg-white text-sub-700">
                                <svg viewBox="0 0 16 16" className="size-3.5 fill-none stroke-current stroke-[2.8]">
                                    <path
                                        d="M3.5 8.4l3 3 6-6.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`[stroke-dasharray:18] transition-[stroke-dashoffset] delay-75 duration-200 ${state === "ok" ? "[stroke-dashoffset:0]" : "[stroke-dashoffset:18]"}`}
                                    />
                                </svg>
                            </b>
                            {doneLabel}
                        </span>
                    </button>
                </div>
            </div>

            <span aria-live="polite" className="sr-only">
                {state === "load" ? "분석 요청 중" : state === "ok" ? doneLabel : ""}
            </span>
        </div>
    );
}
