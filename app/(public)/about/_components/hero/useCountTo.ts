import { useEffect, useRef, useState } from "react";

interface Options {
    duration?: number;   // 바뀌는 시간 (ms)
    decimals?: number;   // 소수점 자리
    from?: number;       // 처음 시작 숫자 (없으면 목표값에서 시작)
}

// 숫자가 목표값까지 부드럽게 바뀜
export function useCountTo(target: number, { duration = 800, decimals = 0, from }: Options = {}) {
    const startValue = from ?? target;
    const [value, setValue] = useState(startValue);
    const fromRef = useRef(startValue);

    useEffect(() => {
        const begin = fromRef.current;
        const startTime = performance.now();
        const p = Math.pow(10, decimals);
        let frame = 0;

        const tick = (now: number) => {
            const t = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            const next = Math.round((begin + (target - begin) * eased) * p) / p;
            setValue(next);
            fromRef.current = next;
            if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, duration, decimals]);

    return value;
}