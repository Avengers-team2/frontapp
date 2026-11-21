import ScoreSummary from "../ScoreSummary";
import type { PreStartupResultView } from "@/types/analysis-result";

interface PreStartupResultProps {
  result: PreStartupResultView;
}

export default function PreStartupResult({ result }: PreStartupResultProps) {
  const { closure } = result;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-ink-900">{result.title}</h2>
        <p className="text-sm text-ink-600">{result.conditionSummary}</p>
        <p className="text-sm font-bold text-ink-800">{result.caveat}</p>
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
        <div className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line">
          <div className="p-4">
            <p className="text-xs text-ink-500">개업 / 폐업 · 최근 4분기</p>
            <p className="mt-1 text-xl font-bold text-ink-900">
              {closure.openCount} / {closure.closeCount}
            </p>
            <p className="mt-1 text-xs text-sub-700">{closure.netChange}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-ink-500">다음 분기 폐업 위험</p>
            <p className="mt-1 text-xl font-bold text-ink-900">{closure.nextQuarterRisk}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-ink-500">집계 기간</p>
            <p className="mt-1 text-xl font-bold text-ink-900">{closure.period}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-bold text-ink-900">위험 요인</h3>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-ink-500">
            <tr>
              <th className="py-2 font-medium">항목</th>
              <th className="py-2 font-medium">실제 수치</th>
              <th className="py-2 font-medium">비교 기준</th>
              <th className="py-2 text-right font-medium">해석</th>
            </tr>
          </thead>
          <tbody>
            {result.riskFactors.map((row) => (
              <tr key={row.item} className="border-b border-line align-top">
                <td className="py-3 font-bold text-ink-900">{row.item}</td>
                <td className="py-3 text-ink-800">{row.actual}</td>
                <td className="py-3 text-ink-500">{row.benchmark}</td>
                <td
                  className={`py-3 text-right font-bold ${
                    row.level === "warn" ? "text-danger-strong" : "text-ink-900"
                  }`}
                >
                  {row.level === "warn" ? "주의" : "보통"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-bold text-ink-900">개선 방향 제안</h3>
        <ul className="divide-y divide-line">
          {result.suggestions.map((s) => (
            <li key={s.label} className="py-3">
              <div className="flex items-baseline gap-4 text-sm">
                <span className="w-24 shrink-0 text-ink-500">{s.label}</span>
                <span className="font-bold text-ink-900">
                  {s.from} <span className="text-sub-700">→</span> {s.to}
                </span>
              </div>
              <p className="mt-1 pl-28 text-xs text-ink-500">{s.reason}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
