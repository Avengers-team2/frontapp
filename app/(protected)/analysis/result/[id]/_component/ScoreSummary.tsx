import { useState } from "react";
import { useInView } from "@/app/(protected)/report-job/_components/Reveal";
import ScoreRing from "./ScoreRing";
import ScoreBar from "./ScoreBar";
import type { ScoreItem } from "@/types/analysis-result";

const RISK_BADGE = {
  safe: "bg-white text-sub-700",
  caution: "bg-warning/20 text-warning-text",
  warn: "bg-danger-bg text-danger-strong",
} as const;

interface ScoreSummaryProps {
  totalScore: number | null; // null 이면 "?"
  scoreLabel: string;
  reliabilityLabel?: string;
  riskLabel?: string;
  riskTone?: "safe" | "caution" | "warn";
  headline: string;
  description: string;
  scoreItems: ScoreItem[];
}

export default function ScoreSummary({
  totalScore,
  scoreLabel,
  reliabilityLabel,
  riskLabel,
  riskTone = "warn",
  headline,
  description,
  scoreItems,
}: ScoreSummaryProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [activeId, setActiveId] = useState<ScoreItem["id"] | null>(null);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-5 rounded-2xl bg-sub-50 p-5">
        <ScoreRing score={totalScore} label="종합 적합도" />
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-white px-2 py-1 text-sub-700">{scoreLabel}</span>
            {reliabilityLabel && (
              <span className="rounded-full bg-white px-2 py-1 text-sub-700">{reliabilityLabel}</span>
            )}
            {riskLabel && (
              <span className={`rounded-full px-2 py-1 ${RISK_BADGE[riskTone]}`}>{riskLabel}</span>
            )}
          </div>
          <p className="whitespace-pre-line text-base font-bold text-ink-900">{headline}</p>
          <p className="text-xs text-ink-500">{description}</p>
        </div>
      </div>

      <div ref={ref} className="space-y-3">
        <h3 className="text-base font-bold text-ink-900">항목별 점수</h3>
        <div className="-mx-2 space-y-1">
          {scoreItems.map((item, index) => (
            <ScoreBar
              key={item.id}
              label={item.label}
              score={item.score}
              tone={item.tone}
              excluded={item.excluded}
              detail={item.detail}
              inView={inView}
              index={index}
              active={activeId === item.id}
              dimmed={activeId !== null && activeId !== item.id}
              onActivate={() => setActiveId(item.id)}
              onDeactivate={() => setActiveId(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
