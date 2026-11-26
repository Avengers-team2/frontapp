// Lucian UX/UI Prompt #017 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#017
"use client";

import { useLayoutEffect, useRef, useState } from "react";

// 값 말풍선 슬라이더 (최소·최대 두 손잡이).
// 조작과 키보드는 투명한 input[type=range] 가 맡고, 보이는 막대·손잡이·말풍선은 그 값을 따라 그린다.

const CLOSE_GAP = 16; // 두 손잡이가 이 간격(%)보다 가까우면 말풍선이 겹치므로 방금 만진 쪽만 보여준다

// 투명한 네이티브 손잡이. 입력칸을 좌우로 16px 씩 넓혀 손잡이 중심이 막대의 0~100% 와 맞게 한다
const NATIVE =
    "pointer-events-none absolute -left-4 top-1/2 z-10 m-0 h-8 w-[calc(100%+32px)] -translate-y-1/2 appearance-none bg-transparent opacity-0 " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-8 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:active:cursor-grabbing " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-8 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:border-0";

const RING = "shadow-[0_0_0_3px_var(--color-sub),0_8px_18px_-6px_rgba(31,58,95,.5)]";
const RING_DRAG =
    "scale-[1.15] shadow-[0_0_0_3px_var(--color-sub),0_0_0_10px_rgba(43,179,163,.18),0_8px_18px_-6px_rgba(31,58,95,.5)]";
const RING_FOCUS = "shadow-[0_0_0_3px_var(--color-sub),0_0_0_8px_rgba(31,58,95,.3)]";

type Side = "min" | "max";

interface DepositSliderProps {
    min: number;
    max: number;
    limit: number;
    step: number;
    ticks: { value: number; label: string }[];
    format: (n: number) => string;
    onChangeMin: (n: number) => void;
    onChangeMax: (n: number) => void;
}

export default function DepositSlider({ min, max, limit, step, ticks, format, onChangeMin, onChangeMax }: DepositSliderProps) {
    const fillRef = useRef<HTMLSpanElement>(null);
    const [active, setActive] = useState<Side>("max");

    const left = (Math.min(min, limit) / limit) * 100;
    const right = (Math.min(max, limit) / limit) * 100;
    const close = right - left < CLOSE_GAP;

    useLayoutEffect(() => {
        fillRef.current?.animate([{ clipPath: `inset(0 ${100 - right}% 0 ${left}% round 999px)` }], {
            duration: 0,
            fill: "forwards",
        });
    }, [left, right]);

    return (
        <div>
            <div className="relative mt-16 h-3 rounded-full bg-line-light shadow-[inset_0_1px_2px_rgba(0,0,0,.08)]">
                <span
                    ref={fillRef}
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-r from-main to-sub [clip-path:inset(0_100%_0_0)] after:absolute after:inset-0 after:bg-linear-to-b after:from-white/35 after:to-transparent after:to-60%"
                />
                <Handle
                    label="보증금 최소"
                    value={min}
                    limit={limit}
                    step={step}
                    position={left}
                    text={format(min)}
                    showBubble={!close || active === "min"}
                    onChange={onChangeMin}
                    onActivate={() => setActive("min")}
                />
                <Handle
                    label="보증금 최대"
                    value={max}
                    limit={limit}
                    step={step}
                    position={right}
                    text={format(max)}
                    showBubble={!close || active === "max"}
                    onChange={onChangeMax}
                    onActivate={() => setActive("max")}
                />
            </div>

            <div aria-hidden className="mt-[18px] flex justify-between text-[12px] font-semibold tabular-nums">
                {ticks.map((t) => (
                    <span
                        key={t.value}
                        className={`relative transition-colors duration-300 before:absolute before:-top-2.5 before:left-1/2 before:-ml-px before:h-[5px] before:w-0.5 before:rounded-[1px] before:bg-current before:opacity-60 ${t.value >= min && t.value <= max ? "text-ink-900" : "text-ink-300"}`}
                    >
                        {t.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

interface HandleProps {
    label: string;
    value: number;
    limit: number;
    step: number;
    position: number; // 0~100
    text: string;
    showBubble: boolean;
    onChange: (n: number) => void;
    onActivate: () => void;
}

function Handle({ label, value, limit, step, position, text, showBubble, onChange, onActivate }: HandleProps) {
    const carrierRef = useRef<HTMLSpanElement>(null);
    const [hover, setHover] = useState(false);
    const [drag, setDrag] = useState(false);
    const [focus, setFocus] = useState(false);

    // 막대 왼쪽 바깥에 둔 같은 너비의 상자를 position% 만큼 옮기면 그 오른쪽 끝이 값 위치가 된다.
    // (오른쪽 바깥으로 삐져나가면 페이지에 가로 스크롤이 생겨서 왼쪽에 둔다)
    useLayoutEffect(() => {
        carrierRef.current?.animate([{ translate: `${position}% 0` }], { duration: 0, fill: "forwards" });
    }, [position]);

    const release = () => setDrag(false);

    return (
        <>
            <input
                type="range"
                min={0}
                max={limit}
                step={step}
                value={Math.min(value, limit)}
                aria-label={label}
                aria-valuetext={text}
                onChange={(e) => onChange(Number(e.target.value))}
                onPointerDown={() => {
                    setDrag(true);
                    setFocus(false);
                    onActivate();
                }}
                onPointerUp={release}
                onPointerCancel={release}
                onPointerEnter={() => setHover(true)}
                onPointerLeave={() => setHover(false)}
                onFocus={(e) => {
                    setFocus(e.target.matches(":focus-visible"));
                    onActivate();
                }}
                onKeyDown={() => setFocus(true)}
                onBlur={() => {
                    setFocus(false);
                    release();
                }}
                className={NATIVE}
            />
            <span ref={carrierRef} aria-hidden className="pointer-events-none absolute inset-y-0 right-full w-full">
                <span
                    className={`absolute right-0 top-1/2 -mr-4 -mt-4 size-8 rounded-full bg-white transition-[scale,box-shadow] duration-300 ease-[cubic-bezier(.34,1.45,.64,1)] motion-reduce:transition-none ${drag ? RING_DRAG : `${focus ? RING_FOCUS : RING} ${hover ? "scale-[1.08]" : ""}`}`}
                />
                <span className="absolute bottom-7 right-0 flex w-0 justify-center">
                    <span className={`relative shrink-0 transition-opacity duration-300 motion-reduce:transition-none ${showBubble ? "opacity-100" : "opacity-0"}`}>
                        <span className="block whitespace-nowrap rounded-[14px] bg-main px-3.5 py-[9px] text-[16px] font-bold tabular-nums leading-tight text-white shadow-[0_12px_24px_-12px_rgba(31,58,95,.5)]">
                            {text}
                        </span>
                        <span className="absolute -bottom-[5px] left-1/2 -ml-1.5 size-3 rotate-45 rounded-[2px] bg-main" />
                    </span>
                </span>
            </span>
        </>
    );
}
