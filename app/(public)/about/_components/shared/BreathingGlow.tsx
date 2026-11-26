"use client";

import { useEffect, useRef } from "react";

// 카드 뒤의 빛이 숨을 들이쉬고 내쉬듯 커지고 밝아졌다가 다시 잦아든다.
// 모션 줄이기를 켜면 가만히 둔다.

const BREATH_MS = 1500; // 들이쉬는 시간 (내쉬는 시간도 같다)

export default function BreathingGlow({ className, delay = 0 }: { className: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const breath = el.animate(
            [
                { scale: "0.75", opacity: 0.35 },
                { scale: "1.35", opacity: 1 },
            ],
            { duration: BREATH_MS, delay, iterations: Infinity, direction: "alternate", easing: "ease-in-out", fill: "backwards" },
        );
        return () => breath.cancel();
    }, [delay]);

    return <div ref={ref} aria-hidden className={`pointer-events-none absolute rounded-full ${className}`} />;
}
