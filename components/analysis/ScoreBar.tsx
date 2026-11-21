import type { ScoreTone } from "@/types/analysis-result";

interface ScoreBarProps {
  label: string;
  score: number; // 0 ~ 100
  tone?: ScoreTone;
}

// 막대 너비와 숫자가 score 값에 그대로 연결된다.
export default function ScoreBar({ label, score, tone = "default" }: ScoreBarProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const barColor = tone === "warn" ? "bg-warning" : "bg-sub-700";

  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-sm text-ink-700">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${clamped}%` }} />
      </div>
      <span className="w-8 text-right text-sm font-bold text-ink-900">{Math.round(clamped)}</span>
    </div>
  );
}
