import ScoreRing from "@/components/analysis/ScoreRing";
import ScoreBar from "@/components/analysis/ScoreBar";
import type { ScoreItem } from "@/types/analysis-result";

interface ScoreSummaryProps {
  totalScore: number;
  scoreLabel: string;
  riskLabel: string;
  headline: string;
  description: string;
  scoreItems: ScoreItem[];
}

export default function ScoreSummary({
  totalScore,
  scoreLabel,
  riskLabel,
  headline,
  description,
  scoreItems,
}: ScoreSummaryProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-5 rounded-2xl bg-sub-50 p-5">
        <ScoreRing score={totalScore} label="종합 적합도" />
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-white px-2 py-1 text-sub-700">{scoreLabel}</span>
            <span className="rounded-full bg-danger-bg px-2 py-1 text-danger-strong">{riskLabel}</span>
          </div>
          <p className="whitespace-pre-line text-base font-bold text-ink-900">{headline}</p>
          <p className="text-xs text-ink-500">{description}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-ink-900">항목별 점수</h3>
        {scoreItems.map((item) => (
          <ScoreBar key={item.id} label={item.label} score={item.score} tone={item.tone} />
        ))}
      </div>
    </section>
  );
}
