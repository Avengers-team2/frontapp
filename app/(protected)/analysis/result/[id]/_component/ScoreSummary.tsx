import { useState } from "react";
import { useInView } from "@/app/(protected)/report-job/_components/Reveal";
import ScoreRing from "./ScoreRing";
import RadarChart from "./RadarChart";
import ScoreBar, { BAR_WIDTH } from "./ScoreBar";
import { DIVIDED } from "./result/Card";
import type { ScoreItem } from "@/types/analysis-result";

// 폐업 위험 배지 색
const RISK_BADGE = {
  safe: "bg-sub-50 text-sub-700",
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
  rankPercent?: number; // 12 = 상위 12%
  footnote?: string; // 항목별 점수 아래 안내 문구
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
  rankPercent,
  footnote,
}: ScoreSummaryProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [activeId, setActiveId] = useState<ScoreItem["id"] | null>(null);
  const { ref: heroRef, inView: heroInView } = useInView<HTMLDivElement>(0.3);

  // 가장 좋은 항목 / 보완이 필요한 항목 (점수가 있는 항목끼리)
  const ranked = scoreItems.filter((item) => !item.excluded).sort((a, b) => b.score - a.score);
  const best = ranked.length >= 2 ? ranked[0] : undefined;
  const worst = ranked.length >= 2 && ranked[ranked.length - 1].score < 70 ? ranked[ranked.length - 1] : undefined;
  const position = rankPercent == null ? 0 : Math.min(100, Math.max(0, Math.round(100 - rankPercent)));

  return (
    <section className="space-y-4">
      <div ref={heroRef} className={`space-y-4 pb-2 ${DIVIDED}`}>
        <div className="flex items-center gap-4">
          <ScoreRing score={totalScore} label="종합 적합도" />
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
              <span className="rounded-full bg-surface px-2.5 py-1 text-ink-700">{scoreLabel}</span>
              {reliabilityLabel && (
                <span className="rounded-full bg-sub-50 px-2.5 py-1 text-sub-700">{reliabilityLabel}</span>
              )}
              {riskLabel && (
                <span className={`rounded-full px-2.5 py-1 ${RISK_BADGE[riskTone]}`}>{riskLabel}</span>
              )}
            </div>
            <p className="whitespace-pre-line text-base font-bold leading-snug text-main-dark">{headline}</p>
            <p className="text-[11px] leading-relaxed text-ink-300">{description}</p>
          </div>
        </div>

        {rankPercent != null && (
          <div className="space-y-2 rounded-2xl bg-point-blue-50 px-4 py-3">
            <p className="flex items-center justify-between text-xs">
              <span className="text-ink-700">이 업종에서 점수</span>
              <b className="text-point-blue">상위 {rankPercent}%</b>
            </p>
            <div className="mx-1.5 h-1.5 rounded-full bg-line">
              <div
                className={`relative h-full rounded-full bg-point-mint transition-[width] delay-300 duration-900 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none ${BAR_WIDTH[heroInView ? position : 0]}`}
              >
                <i className="absolute -right-1.5 -top-[3px] size-3 rounded-full border-2 border-point-mint bg-white" />
              </div>
            </div>
            <p aria-hidden className="flex justify-between text-[10px] text-ink-300">
              <span>하위</span>
              <span>상위</span>
            </p>
          </div>
        )}

        {(best || worst) && (
          <div className="grid grid-cols-2 gap-2.5">
            {best && (
              <div className="rounded-2xl bg-point-blue-50 px-4 py-3">
                <p className="text-[11px] text-point-blue">가장 좋은 항목</p>
                <p className="mt-0.5 text-sm font-bold text-main-dark">
                  {best.label.replace(/ \(.*\)$/, "")} · {Math.round(best.score)}점
                </p>
              </div>
            )}
            {worst && (
              <div className="rounded-2xl bg-warning/10 px-4 py-3">
                <p className="text-[11px] text-warning-text">보완이 필요한 항목</p>
                <p className="mt-0.5 text-sm font-bold text-main-dark">
                  {worst.label.replace(/ \(.*\)$/, "")} · {Math.round(worst.score)}점
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={ref} className={`space-y-2 ${DIVIDED}`}>
        <h3 className="text-lg font-bold tracking-tight text-main-dark">항목별 점수</h3>
        <RadarChart items={scoreItems} activeId={activeId} />
        <div className="-mx-2 divide-y divide-line-light border-t border-line-light">
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
        {footnote && <p className="pt-1 text-[11px] leading-relaxed text-ink-300">{footnote}</p>}
      </div>
    </section>
  );
}
