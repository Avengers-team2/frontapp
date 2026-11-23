interface ScoreRingProps {
  score: number; // 0 ~ 100
  label?: string;
  tone?: "default" | "warn";
}

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// score 값에 따라 호의 길이가 바로 바뀐다 (CSS 애니메이션 없이 데이터만 반영).
export default function ScoreRing({ score, label, tone = "default" }: ScoreRingProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const stroke = tone === "warn" ? "#F5A524" : "#2BB3A3";

  return (
    <div className="relative size-24 shrink-0">
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
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-main">{Math.round(clamped)}</span>
        {label && <span className="text-[10px] text-ink-500">{label}</span>}
      </div>
    </div>
  );
}
