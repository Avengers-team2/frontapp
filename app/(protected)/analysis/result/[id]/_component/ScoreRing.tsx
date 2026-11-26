import { useEffect, useState } from "react";
import { useInView } from "@/app/(protected)/report-job/_components/Reveal";

interface ScoreRingProps {
  score: number | null; // 0 ~ 100. null 이면 점수를 낼 수 없는 경우라 가운데에 "?"를 보여준다
  label?: string;
  tone?: "default" | "warn";
}

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const COUNT_MS = 1000;

// 화면에 들어오면 0부터 점수까지 세어 올라간다 (모션 줄이기를 켜면 바로 최종 점수)
function useCountUp(target: number, go: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!go) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let id = 0;
    const step = (t: number) => {
      const k = reduce ? 1 : Math.min(1, (t - t0) / COUNT_MS);
      setValue(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, go]);

  return value;
}

// 화면에 들어오면 호가 차오르고 가운데 숫자가 0부터 세어 올라간다.
export default function ScoreRing({ score, label, tone = "default" }: ScoreRingProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const hasScore = score != null;
  const clamped = Math.min(100, Math.max(0, score ?? 0));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const stroke = tone === "warn" ? "#F5A524" : "#2BB3A3";
  const shown = useCountUp(clamped, inView && hasScore);

  return (
    <div ref={ref} className="relative size-24 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="8" className="stroke-line" />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke={stroke}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={inView ? offset : CIRCUMFERENCE}
          className="transition-[stroke-dashoffset] delay-150 duration-1000 ease-[cubic-bezier(0.3,0.7,0.2,1)] motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="sr-only">{hasScore ? Math.round(clamped) : "점수 없음"}</span>
        <span
          aria-hidden="true"
          className={`text-2xl font-bold tabular-nums ${hasScore ? "text-main" : "text-ink-300"}`}
        >
          {hasScore ? Math.round(shown) : "?"}
        </span>
        {label && <span className="text-[10px] text-ink-500">{label}</span>}
      </div>
    </div>
  );
}
