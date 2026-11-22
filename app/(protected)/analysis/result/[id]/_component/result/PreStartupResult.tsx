import ScoreSummary from "../ScoreSummary";
import type { PreStartupResultView } from "@/types/analysis-result";

interface PreStartupResultProps {
  result: PreStartupResultView;
}

export default function PreStartupResult({ result }: PreStartupResultProps) {
  const { closure } = result;

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-sm text-ink-600">
        <h2 className="text-2xl font-bold text-ink-900">{result.title}</h2>
        <p>{result.conditionSummary}</p>
        <p className="font-bold text-ink-800">{result.caveat}</p>
      </header>

      <ScoreSummary
        totalScore={result.totalScore}
        scoreLabel={result.scoreLabel}
        riskLabel={result.riskLabel}
        headline={result.headline}
        description={result.description}
        scoreItems={result.scoreItems}
      />

      <section className="space-y-3">
        <h3 className="text-base font-bold text-ink-900">폐업 · 안정성 근거</h3>
        <div className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line text-xs text-ink-500">
          <div className="space-y-1 p-4">
            <p>개업 / 폐업 · 최근 4분기</p>
            <p className="text-xl font-bold text-ink-900">
              {closure.openCount} / {closure.closeCount}
            </p>
            <p className="text-sub-700">{closure.netChange}</p>
          </div>
          <div className="space-y-1 p-4">
            <p>다음 분기 폐업 위험</p>
            <p className="text-xl font-bold text-ink-900">{closure.nextQuarterRisk}</p>
          </div>
          <div className="space-y-1 p-4">
            <p>집계 기간</p>
            <p className="text-xl font-bold text-ink-900">{closure.period}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-bold text-ink-900">위험 요인</h3>
        <div className="grid grid-cols-[1.2fr_1.5fr_1.5fr_0.6fr] gap-x-4 text-sm text-ink-800">
          <div className="col-span-full grid grid-cols-subgrid border-b border-line py-2 text-xs font-medium text-ink-500">
            <div>항목</div>
            <div>실제 수치</div>
            <div>비교 기준</div>
            <div className="text-right">해석</div>
          </div>
          {result.riskFactors.map((row) => (
            <div
              key={row.item}
              className="col-span-full grid grid-cols-subgrid items-start border-b border-line py-3"
            >
              <div className="font-bold text-ink-900">{row.item}</div>
              <div>{row.actual}</div>
              <div className="text-ink-500">{row.benchmark}</div>
              <div
                className={`text-right font-bold ${
                  row.level === "warn" ? "text-danger-strong" : "text-ink-900"
                }`}
              >
                {row.level === "warn" ? "주의" : "보통"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-bold text-ink-900">개선 방향 제안</h3>
        <ul className="divide-y divide-line text-sm text-ink-500">
          {result.suggestions.map((s) => (
            <li key={s.label} className="py-3">
              <div className="flex items-baseline gap-4">
                <span className="w-24 shrink-0">{s.label}</span>
                <span className="font-bold text-ink-900">
                  {s.from} <span className="text-sub-700">→</span> {s.to}
                </span>
              </div>
              <p className="mt-1 pl-28 text-xs">{s.reason}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
