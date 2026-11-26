import type { Analysis, AnalysisResultDetail } from "@/types/analysis";
import type {
  ChartItem,
  CompareRow,
  PreStartupResultView,
  ResultStat,
  ScoreItem,
} from "@/types/analysis-result";

// 백엔드 분석 결과(Analysis)를 화면용(PreStartupResultView)으로 바꾼다. 화면은 이 형태만 안다.
// 서버에 없는 값(차트류)은 undefined 로 두고, 화면에서 그 구간을 숨긴다.

const WARN_BELOW = 50; // 항목 점수가 이 값 미만이면 막대를 주황색으로

export interface ResultContext {
  areaName?: string | null;
  industry?: string | null;
}

// 항목 점수 정의. label 은 막대에, short 는 요약 문장에 쓴다.
const SCORE_DEFS: { id: string; label: string; short: string; pick: (a: Analysis) => number | null }[] = [
  { id: "sales", label: "매출 잠재력", short: "매출 잠재력", pick: (a) => a.analysis_sales_score },
  { id: "competition", label: "경쟁 환경", short: "경쟁 환경", pick: (a) => a.analysis_competition_score },
  { id: "customer", label: "고객층 적합성", short: "고객층 적합성", pick: (a) => a.analysis_customer_score },
  { id: "time", label: "시간대 적합성", short: "시간대 적합성", pick: (a) => a.analysis_time_score },
  { id: "closure", label: "폐업 위험 (낮을수록 높은 점수)", short: "폐업 위험", pick: (a) => a.analysis_closure_score },
  { id: "stability", label: "상권 안정성", short: "상권 안정성", pick: (a) => a.analysis_stability_score },
];

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

// "20271" → "2027년 1분기"
export function formatQuarter(q: string | null | undefined): string {
  const m = q?.match(/^(\d{4})(\d)$/);
  return m ? `${m[1]}년 ${m[2]}분기` : (q ?? "");
}

// 7957789479 → "79.6억원"
export function formatKRW(v: number): string {
  if (v >= 1e8) return `${(v / 1e8).toFixed(1)}억원`;
  if (v >= 1e4) return `${Math.round(v / 1e4).toLocaleString()}만원`;
  return `${v.toLocaleString()}원`;
}

const pct = (r: number, digits = 1) => `${r > 0 ? "+" : ""}${(r * 100).toFixed(digits)}%`;

// "20" → "20대", "60_이상" → "60대 이상"
const ageLabel = (k: string) => k.replace(/^(\d+)_(.+)$/, "$1대 $2").replace(/^(\d+)$/, "$1대");

// "20244" → "24.4Q"
export const shortQuarter = (q: string) => (/^\d{4}\d$/.test(q) ? `${q.slice(2, 4)}.${q.slice(4)}Q` : q);

// 서버가 주는 금액 항목 이름에 기준 기간(분기 합계)을 붙인다. 백엔드 기준: 매출 금액은 분기(3개월) 합계
export const salesLabel = (label: string) =>
  label === "매출" ? "분기 매출 합계" : label === "점포당 매출" ? "점포당 분기 매출" : label;

// 비교 표 숫자: 단위에 맞게 읽기 쉽게
function formatCompare(v: number, unit = ""): string {
  if (unit === "원") return formatKRW(v);
  if (unit === "%") return `${v.toFixed(1)}%`;
  return `${v.toLocaleString(undefined, { maximumFractionDigits: v >= 100 ? 0 : 1 })}${unit}`;
}

// { 라벨: 값 } → 합계 대비 비중(%). 값이 비율이든 금액이든 상관없다. order 가 있으면 그 순서로 정렬한다.
function toShares(
  rec: Record<string, number> | undefined,
  order?: string[],
  labelFn: (k: string) => string = (k) => k,
): ChartItem[] | undefined {
  if (!rec) return undefined;
  const entries = Object.entries(rec).filter(([, v]) => typeof v === "number" && v >= 0);
  const sum = entries.reduce((acc, [, v]) => acc + v, 0);
  if (entries.length === 0 || sum <= 0) return undefined;
  const sorted = order ? [...entries].sort((x, y) => order.indexOf(x[0]) - order.indexOf(y[0])) : entries;
  return sorted.map(([label, v]) => ({ label: labelFn(label), value: (v / sum) * 100 }));
}

function toCompareRows(rows: AnalysisResultDetail["compare_average"]): CompareRow[] | undefined {
  if (!rows || rows.length === 0) return undefined;
  return rows.map((r) => {
    const ratio = r.average > 0 ? r.mine / r.average : null;
    let note: string | undefined;
    if (ratio != null) {
      note =
        ratio >= 2
          ? `평균의 ${ratio.toFixed(1)}배`
          : `평균보다 ${Math.abs((ratio - 1) * 100).toFixed(0)}% ${ratio >= 1 ? "높음" : "낮음"}`;
    }
    return { label: salesLabel(r.label), mine: formatCompare(r.mine, r.unit), average: formatCompare(r.average, r.unit), note, mineValue: r.mine, averageValue: r.average };
  });
}

const RISK_TONE = { 낮음: "safe", 보통: "caution", 높음: "warn" } as const;

export function toPreStartupView(a: Analysis, ctx: ResultContext = {}): PreStartupResultView {
  const d = (a.analysis_result_detail ?? {}) as AnalysisResultDetail;
  // estimate_type 이 없는 예전 결과는 점수 화면(normal)으로 본다
  const isNoData = d.estimate_type === "noData";
  const dataQuarterLabel = formatQuarter(a.analysis_data_quarter);

  const entered = SCORE_DEFS.flatMap((def) => {
    const score = def.pick(a);
    return score == null ? [] : [{ def, score }];
  });

  // 점수가 없는 항목(입력하지 않았거나 점수를 낼 수 없음)도 목록에는 남기고, 점수 자리에 "?"와 사유를 보여준다
  const scoreItems: ScoreItem[] = SCORE_DEFS.map((def) => {
    const score = def.pick(a);
    const ind = d.indicators?.[def.id];
    return score == null
      ? { id: def.id, label: def.label, score: 0, tone: "default", excluded: true, detail: ind?.reason ?? undefined }
      : {
          id: def.id,
          label: def.label,
          score,
          tone: score < WARN_BELOW ? "warn" : "default",
          detail: ind?.detail ?? undefined,
        };
  });

  // 요약 문장: 가장 높은 항목과 가장 낮은 항목 (입력한 항목끼리만)
  let headline = "분석 결과를 정리했습니다";
  if (isNoData) {
    headline = "이 조합은 점수를 낼 수 없습니다";
  } else if (entered.length >= 2) {
    const sorted = [...entered].sort((x, y) => y.score - x.score);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    headline =
      worst.score >= 70
        ? "모든 항목이 고르게 양호합니다"
        : `${best.def.short} 항목이 가장 좋고,\n${worst.def.short} 항목은 보완이 필요합니다`;
  }

  const grade = a.analysis_closure_grade;

  // 참고용 예측 매출. 오차가 커서 보조 정보로만 작게 보여준다 (금액은 "분기 매출 합계"로 표기한다)
  const prediction =
    !isNoData && a.analysis_predicted_sales != null
      ? {
          value: formatKRW(a.analysis_predicted_sales),
          quarter: formatQuarter(a.analysis_predict_quarter),
          baseQuarter: dataQuarterLabel,
          changeRate: d.sales_change_rate != null ? `현재 대비 ${pct(d.sales_change_rate)}` : undefined,
        }
      : undefined;

  // 매출 · 폐업 근거
  const stats: ResultStat[] = [];
  if (d.current_sales != null)
    stats.push({
      label: "현재 분기 매출 합계",
      value: formatKRW(d.current_sales),
      note: `${dataQuarterLabel} 기준`,
    });
  if (d.sales_change_rate != null)
    stats.push({ label: "매출 변화율", value: pct(d.sales_change_rate), note: "현재 대비 예측" });
  if (d.closure_probability != null)
    stats.push({
      label: "폐업 확률",
      value: `${(d.closure_probability * 100).toFixed(2)}%`,
      note: grade ? `등급 ${grade}` : undefined,
    });

  // 경쟁 현황
  const competition: ResultStat[] = [];
  if (d.store_count != null) competition.push({ label: "점포 수", value: `${d.store_count}개` });
  if (d.similar_store_count != null)
    competition.push({ label: "유사 업종 점포 수", value: `${d.similar_store_count}개` });

  const ft = d.foot_traffic;
  const footTraffic = ft
    ? {
        byAge: toShares(ft.age, undefined, ageLabel),
        byHour: toShares(ft.hour),
        byWeekday: toShares(ft.weekday, WEEKDAYS),
      }
    : undefined;

  return {
    kind: isNoData ? "noData" : "normal",
    industryCode: d.industry_code,
    title: [ctx.areaName, ctx.industry].filter(Boolean).join(" · ") || "분석 결과",
    caveat: isNoData
      ? `${dataQuarterLabel} 실제 데이터 기준 · 모델 예측 아님`
      : "이 결과 분석의 점수, 예측값은 이전 데이터를 이용한 예측값일 뿐이며, 실제 결과를 보장하지 않습니다.",
    notice: isNoData ? (d.data_notice ?? undefined) : undefined,
    staleNotice: d.data_not_latest ? "최신 데이터가 아닐 수 있습니다" : undefined,
    totalScore: a.analysis_total_score ?? null, // null 이면 화면에서 "?"
    scoreLabel: isNoData ? "점수 없음" : "종합 적합도 · 0~100", // analysis_grade 는 항상 null 이라 쓰지 않는다
    reliabilityLabel: !isNoData && d.reliability ? `신뢰도 ${d.reliability}` : undefined,
    riskLabel: isNoData ? undefined : grade ? `폐업 위험 ${grade}` : "폐업 위험 확인 필요",
    riskTone: (grade && RISK_TONE[grade as keyof typeof RISK_TONE]) || "caution",
    prediction,
    dataQuarterLabel,
    rankLabel: d.rank_percent != null ? `이 업종에서 점수 상위 ${d.rank_percent}%` : undefined,
    rankPercent: d.rank_percent ?? undefined,
    referenceSales: isNoData ? (d.reference_sales ?? undefined) : undefined,
    infoPanel: isNoData ? (d.info_panel ?? undefined) : undefined,
    headline,
    description: isNoData
      ? "종합 점수와 항목별 점수는 ?로 표시됩니다"
      : `${entered.map((s) => s.def.short).join(" · ")} ${entered.length}개 항목 종합`,
    scoreItems,
    evidence: { title: "매출 · 폐업 근거", stats },
    competition: competition.length > 0 ? competition : undefined,
    salesByWeekday: toShares(d.sales_by_weekday, WEEKDAYS),
    salesByHour: toShares(d.sales_by_hour),
    customerByAge: toShares(d.customer_by_age, undefined, ageLabel),
    customerByGender: toShares(d.customer_by_gender),
    footTraffic:
      footTraffic && (footTraffic.byAge || footTraffic.byHour || footTraffic.byWeekday) ? footTraffic : undefined,
    openCloseTrend:
      d.open_close_trend && d.open_close_trend.length > 0
        ? d.open_close_trend.map((t) => ({ ...t, quarter: shortQuarter(t.quarter) }))
        : undefined,
    compareAverage: toCompareRows(d.compare_average),
    risks: d.risks ?? [],
    improvements: d.improvements ?? [],
  };
}
