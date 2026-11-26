import { useRouter, useSearchParams } from "next/navigation";
import { useInView } from "@/app/(protected)/report-job/_components/Reveal";
import { DEFAULT_VALUES, FORM_DRAFT_KEY, FORM_RESTORE_KEY } from "@/app/(protected)/analysis/_component/analysis.data";
import type {
  AreaCompare,
  AreaIndustries,
  CompareRowData,
  ForecastPoint,
  FranchiseShare,
  FrontIndustry,
  RecommendedIndustries,
  SalesTrendPoint,
} from "@/types/analysis-insights";
import { formatKRW, formatQuarter, salesLabel, shortQuarter } from "../analysisResult.mapper";
import { BAR_DELAY, BAR_WIDTH } from "../ScoreBar";
import type { InsightsState } from "../useAnalysisInsights";
import Card from "./Card";
import { MetricBars } from "./charts";

// 결과 화면 맨 아래 "추가 정보" 영역: 업종 순위, 매출 추세·예측, 다른 업종 추천, 상권 비교, 프랜차이즈 비중.
// 추정·참고용 데이터라 단정하는 문구를 피하고, 금액은 "분기 매출 합계"로 쓴다. 값이 없는 영역은 통째로 숨긴다.

const FILL_MOTION = "duration-900 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none";
const pick = <T,>(table: T[], index: number) => table[Math.min(index, table.length - 1)];
const clampPercent = (v: number) => Math.min(100, Math.max(0, Math.round(v)));
const percent = (ratio: number) => `${Math.round(ratio * 100)}%`;
const rate = (v: number | null | undefined) => (v == null ? "-" : `${v}%`);
const signed = (ratio: number) => `${ratio > 0 ? "+" : ""}${(ratio * 100).toFixed(1)}%`;

// 비교 표 숫자: 단위에 맞게 읽기 쉽게
function formatValue(v: number | null, unit: string): string {
  if (v == null) return "-";
  if (unit === "원") return formatKRW(v);
  if (unit === "%") return `${v.toFixed(1)}%`;
  return `${Math.round(v).toLocaleString()}${unit}`;
}

// 처음 불러오는 7초쯤 동안 각 영역 자리를 먼저 잡아 둔다
function InsightsSkeleton() {
  return (
    <div role="status" className="space-y-6">
      <p className="flex items-center gap-2 text-xs text-ink-400">
        <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-sub" />
        추가 정보를 불러오는 중입니다 (처음엔 몇 초 걸립니다)
      </p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
          <div className="h-24 animate-pulse rounded-xl bg-surface" />
        </div>
      ))}
    </div>
  );
}

// ① 이 상권에서 점포가 많은 업종 (가로 막대, 선택 업종은 강조)
function IndustryRanking({ data }: { data: AreaIndustries }) {
  const { ref, inView } = useInView<HTMLUListElement>(0.2);
  const mine = data.my_industry;
  const inTop = !!mine && data.top.some((i) => i.industry_code === mine.industry_code);
  const rows = mine && !inTop ? [...data.top, mine] : data.top;
  const max = Math.max(...rows.map((r) => r.store_count), 1);
  if (rows.length === 0) return null;

  return (
    <Card
      title="이 상권에서 점포가 많은 업종"
      sub={mine ? `${data.industry_kind_count}개 업종 중 ${mine.rank}위` : `${data.industry_kind_count}개 업종`}
    >
      {!mine && <p className="text-xs text-ink-500">선택한 업종은 이 상권에 점포 기록이 없습니다.</p>}
      <ul ref={ref} className="space-y-2">
        {rows.map((item, index) => {
          const isMine = item.industry_code === mine?.industry_code;
          const separated = mine && !inTop && index === data.top.length;
          return (
            <li key={item.industry_code} className={separated ? "border-t border-dashed border-line pt-2" : undefined}>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-6 shrink-0 text-right text-xs font-bold text-ink-300">{item.rank}</span>
                <span className="flex w-28 shrink-0 flex-col">
                  <span className={`truncate ${isMine ? "font-bold text-point-blue" : "text-ink-700"}`}>
                    {item.industry_name ?? item.industry_code}
                  </span>
                  {!item.has_sales_data && <span className="text-[10px] text-ink-300">분석 데이터 없음</span>}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line-light">
                  <div
                    className={`h-full rounded-full transition-[width] ${FILL_MOTION} ${
                      isMine ? "bg-main-dark" : item.has_sales_data ? "bg-point-blue" : "bg-point-blue/30"
                    } ${BAR_WIDTH[inView ? clampPercent((item.store_count / max) * 100) : 0]} ${pick(BAR_DELAY, index)}`}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-bold text-ink-900">{item.store_count}곳</span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

// ② 매출 추세: 실제 5분기는 실선, 예측 5분기는 점선(참고용)
const CHART = { w: 320, h: 150, left: 10, right: 10, top: 22, bottom: 26 };

function SalesTrendChart({ trend, forecast }: { trend: SalesTrendPoint[]; forecast: ForecastPoint[] | null }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  if (trend.length < 2) return null;

  const values = trend.map((p) => p.sales);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = CHART.w - CHART.left - CHART.right;
  const innerH = CHART.h - CHART.top - CHART.bottom;
  const x = (i: number) => CHART.left + (innerW * i) / (trend.length - 1);
  const y = (v: number) => CHART.top + innerH - ((v - min) / span) * innerH;
  const pts = trend.map((p, i) => ({ ...p, cx: x(i), cy: y(p.sales) }));

  const firstPredicted = pts.findIndex((p) => p.kind === "predicted");
  const actual = firstPredicted === -1 ? pts : pts.slice(0, firstPredicted);
  // 예측선은 마지막 실제 값에서 이어서 그린다
  const predicted = firstPredicted === -1 ? [] : pts.slice(Math.max(firstPredicted - 1, 0));
  const line = (arr: typeof pts) => arr.map((p, i) => `${i === 0 ? "M" : "L"}${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(" ");
  // 분석이 기준으로 삼은 예측 분기
  const selected = forecast?.find((f) => f.is_selected);
  const selectedPoint = selected ? pts.find((p) => p.quarter === selected.quarter && p.kind === "predicted") : undefined;

  return (
    <div ref={ref} className="space-y-2">
      <svg viewBox={`0 0 ${CHART.w} ${CHART.h}`} className="w-full" role="img" aria-label="분기별 매출 추세와 예측">
        {actual.length > 1 && (
          <path
            d={line(actual)}
            pathLength={1}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={inView ? 0 : 1}
            className="stroke-point-blue transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
          />
        )}
        {predicted.length > 1 && (
          <path
            d={line(predicted)}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 5"
            className={`stroke-warning transition-opacity duration-700 motion-reduce:transition-none ${
              inView ? "opacity-100 delay-700" : "opacity-0"
            }`}
          />
        )}
        {pts.map((p, i) => (
          <g key={`${p.quarter}-${p.kind}`}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r={p === selectedPoint ? 5 : 3}
              className={`${p.kind === "actual" ? "fill-point-blue" : "fill-warning"} stroke-white transition-opacity duration-500 motion-reduce:transition-none ${
                inView ? "opacity-100" : "opacity-0"
              }`}
              strokeWidth="1.5"
            />
            {/* 분기 라벨은 하나 걸러 보여준다. 끝 두 개는 겹치지 않게 마지막만, 양 끝은 잘리지 않게 안쪽으로 붙인다 */}
            {((i % 2 === 0 && i !== pts.length - 2) || i === pts.length - 1) && (
              <text
                x={p.cx}
                y={CHART.h - 8}
                textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"}
                className="fill-ink-400 text-[9px]"
              >
                {shortQuarter(p.quarter)}
              </text>
            )}
          </g>
        ))}
        {selectedPoint && (
          <text
            x={Math.min(Math.max(selectedPoint.cx, 36), CHART.w - 36)}
            y={selectedPoint.cy - 10}
            textAnchor="middle"
            className="fill-warning-text text-[10px] font-bold"
          >
            분석 기준 예측
          </text>
        )}
      </svg>
      <div className="flex items-center justify-between text-[11px] text-ink-400">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <i className="h-0.5 w-4 bg-point-blue" /> 실제
          </span>
          <span className="flex items-center gap-1">
            <i className="h-0.5 w-4 border-t-2 border-dashed border-warning" /> 예측(참고용)
          </span>
        </span>
        <span>
          분기 매출 합계 {formatKRW(min)} ~ {formatKRW(max)}
        </span>
      </div>
    </div>
  );
}

// 1~5분기 뒤 예측을 한눈에 비교하는 표 (참고용)
function ForecastTable({ forecast }: { forecast: ForecastPoint[] }) {
  if (forecast.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-line-light text-xs">
      <div className="grid grid-cols-[1.2fr_1.3fr_0.8fr_0.9fr] gap-x-2 border-b border-line-light bg-point-blue-50 px-3 py-2 font-medium text-ink-500">
        <span>시점</span>
        <span className="text-right">예측 분기 매출</span>
        <span className="text-right">증감률</span>
        <span className="text-right">폐업 확률</span>
      </div>
      {forecast.map((f) => (
        <div
          key={f.horizon}
          className={`grid grid-cols-[1.2fr_1.3fr_0.8fr_0.9fr] gap-x-2 border-b border-line px-3 py-2.5 last:border-b-0 ${
            f.is_selected ? "bg-warning/10" : ""
          }`}
        >
          <span className="text-ink-700">
            {f.horizon}분기 뒤
            <span className="block text-[10px] text-ink-400">{formatQuarter(f.quarter)}</span>
            {f.is_selected && <span className="block text-[10px] font-bold text-warning-text">분석 기준</span>}
          </span>
          <span className="text-right font-bold text-ink-900">{formatKRW(f.predicted_sales)}</span>
          <span className={`text-right ${f.change_rate < 0 ? "text-danger-strong" : "text-sub-700"}`}>{signed(f.change_rate)}</span>
          <span className="text-right text-ink-700">{(f.closure_probability * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

// ③ 이 상권에서 점수가 높은 다른 업종 (참고용). 우리 업종과 연결되면 그 업종으로 다시 분석해 볼 수 있다.
function Recommendations({
  data,
  areaCode,
  areaName,
  onPick,
}: {
  data: RecommendedIndustries;
  areaCode: string | null;
  areaName: string | null;
  onPick: (front: FrontIndustry, areaCode: string | null, areaName: string | null) => void;
}) {
  return (
    <Card title="다른 업종도 살펴보세요" sub="참고용">
      <p className="text-xs leading-relaxed text-ink-500">
        {data.basis}
        {data.my_industry_rank != null && ` 선택한 업종은 후보 ${data.candidate_count}곳 중 ${data.my_industry_rank}위입니다.`}
      </p>
      {data.items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-sm text-ink-300">
          비교할 만한 다른 업종이 아직 없습니다
        </p>
      ) : (
        <ul className="space-y-2">
          {data.items.map((item) => {
            const scores = [
              ["매출", item.sales_score],
              ["경쟁", item.competition_score],
              ["폐업", item.closure_score],
              ["안정", item.stability_score],
            ].filter((s): s is [string, number] => s[1] != null);
            return (
              <li key={item.industry_code} className="space-y-2 rounded-2xl bg-point-blue-50 p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink-900">{item.industry_name ?? item.industry_code}</p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      점포 {item.store_count}곳
                      {item.sales_change_rate != null && ` · 매출 변화 ${signed(item.sales_change_rate)}(예측)`}
                    </p>
                  </div>
                  {item.total_score != null && (
                    <span className="shrink-0 rounded-full bg-point-blue px-2.5 py-1 text-xs font-bold text-white">
                      종합 {Math.round(item.total_score)}점
                    </span>
                  )}
                </div>
                {scores.length > 0 && (
                  <p className="text-[11px] text-ink-400">
                    {scores.map(([label, v]) => `${label} ${Math.round(v)}`).join(" · ")}
                  </p>
                )}
                {item.front_industry && (
                  <button
                    type="button"
                    onClick={() => onPick(item.front_industry!, areaCode, areaName)}
                    className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-900 hover:bg-surface print:hidden"
                  >
                    이 업종으로 다시 분석하기
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

// ④ 상권 비교: 같은 업종의 구 평균·서울 평균과 비교
function CompareBlock({ data }: { data: AreaCompare }) {
  const rows: CompareRowData[] = data.rows ?? [];
  const hasTop = data.gu_top_areas.length > 0;
  if (rows.length === 0 && !hasTop) return null;
  const gu = data.gu ?? "구";

  return (
    <Card title="다른 상권과 비교" sub="같은 업종 기준">
      {data.gu_rank && (
        <p className="text-xs text-ink-500">
          {gu} {data.gu_rank.total}개 상권 중 분기 매출 합계 {data.gu_rank.sales_rank}위입니다.
        </p>
      )}
      {rows.length > 0 && (
        <div className="divide-y divide-line-light">
          {rows.map((row) => (
            <MetricBars
              key={row.label}
              label={salesLabel(row.label)}
              series={[
                { name: "내 상권", value: row.mine, text: formatValue(row.mine, row.unit), color: "bg-point-blue" },
                { name: `${gu} 평균`, value: row.gu_average, text: formatValue(row.gu_average, row.unit), color: "bg-point-mint" },
                { name: "서울 평균", value: row.seoul_average, text: formatValue(row.seoul_average, row.unit), color: "bg-ink-300/60" },
              ]}
            />
          ))}
        </div>
      )}
      {hasTop && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-500">{gu}에서 분기 매출 합계가 높은 상권</p>
          <ol className="divide-y divide-line-light overflow-hidden rounded-2xl border border-line-light text-xs">
            {data.gu_top_areas.map((area, i) => (
              <li key={area.area_code} className={`flex items-center gap-2 px-3 py-2.5 ${area.is_mine ? "bg-sub-50" : ""}`}>
                <span className="w-4 shrink-0 font-bold text-ink-300">{i + 1}</span>
                <span className={`min-w-0 flex-1 truncate ${area.is_mine ? "font-bold text-sub-700" : "text-ink-900"}`}>
                  {area.area_name ?? area.area_code}
                  {area.is_mine && " (내 상권)"}
                </span>
                <span className="shrink-0 text-ink-500">
                  {area.sales != null && `분기 매출 ${formatKRW(area.sales)} · `}점포 {area.store_count}곳 · 폐업률 {rate(area.close_rate)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}

// ⑤ 프랜차이즈 비중: 이 상권 vs 서울 평균 (가로 막대)
function FranchiseBlock({ data }: { data: FranchiseShare }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  if (data.ratio == null) return null;
  const bars = [
    { label: "이 상권", value: data.ratio, color: "bg-point-blue" },
    ...(data.seoul_average_ratio != null ? [{ label: "서울 평균", value: data.seoul_average_ratio, color: "bg-ink-300/60" }] : []),
  ];

  return (
    <Card title="프랜차이즈 비중" sub="이름 등으로 추정한 값">
      <p className="text-sm text-ink-800">
        점포 {data.store_count}곳 중 프랜차이즈로 보이는 점포는 {data.franchise_store_count}곳입니다. ({percent(data.ratio)}
        {data.seoul_average_ratio != null && ` · 서울 평균 ${percent(data.seoul_average_ratio)}`})
      </p>
      <div ref={ref} className="space-y-2">
        {bars.map((bar, index) => (
          <div key={bar.label} className="flex items-center gap-3 text-xs">
            <span className="w-14 shrink-0 text-ink-700">{bar.label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line-light">
              <div
                className={`h-full rounded-full transition-[width] ${FILL_MOTION} ${bar.color} ${
                  BAR_WIDTH[inView ? clampPercent(bar.value * 100) : 0]
                } ${pick(BAR_DELAY, index)}`}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-bold text-ink-900">{percent(bar.value)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function InsightsSection({ insights }: { insights: InsightsState }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const areaCode = searchParams.get("area");
  const areaName = searchParams.get("areaName");

  // 다른 업종으로 다시 분석: 입력 화면을 그 업종이 골라진 채로 연다 (지금까지 입력한 조건은 그대로 유지).
  // 중분류 전체에 연결된 업종이면 소분류는 비워 두어 직접 고르게 한다.
  const startWith = (front: FrontIndustry, code: string | null, name: string | null) => {
    try {
      const saved = sessionStorage.getItem(FORM_DRAFT_KEY);
      const base = saved ? JSON.parse(saved) : { ...DEFAULT_VALUES, areaCode: code ?? "", areaName: name ?? "" };
      const next = { ...base, industryLarge: front.large, industryMid: front.mid, industrySmall: front.small ?? "" };
      sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(next));
      sessionStorage.setItem(FORM_RESTORE_KEY, "1");
    } catch {
      // 저장소를 못 써도 입력 화면으로는 보낸다 (빈 입력창으로 열림)
    }
    router.push("/analysis");
  };

  // 불러오지 못하면(모델 로드 실패, 미지원 업종 등) 이 영역만 숨기고 분석 결과는 그대로 둔다
  if (insights.failed) return null;

  if (insights.isLoading) {
    return (
      <section className="space-y-4">
        <h3 className="px-1 text-lg font-bold text-main-dark">추가 정보</h3>
        <InsightsSkeleton />
      </section>
    );
  }

  const d = insights.data;
  if (!d) return null;

  const trend = d.sales_trend && d.sales_trend.length >= 2 ? d.sales_trend : null;
  const blocks = [
    d.area_industries && d.area_industries.top.length > 0,
    trend,
    d.recommended_industries,
    d.area_compare && (d.area_compare.rows || d.area_compare.gu_top_areas.length > 0),
    d.franchise && d.franchise.ratio != null,
  ];
  if (!blocks.some(Boolean)) return null;

  return (
    <section className="space-y-4">
      <div className="space-y-1 px-1 pt-3">
        <h3 className="px-1 text-lg font-bold text-main-dark">추가 정보</h3>
        <p className="text-xs text-ink-400">{formatQuarter(d.base_quarter)} 데이터 기준 · 참고용입니다</p>
      </div>

      {d.area_industries && <IndustryRanking data={d.area_industries} />}

      {trend && (
        <Card title="분기 매출 추세" sub="예측은 참고용">
          <SalesTrendChart trend={trend} forecast={d.forecast} />
          {d.forecast && <ForecastTable forecast={d.forecast} />}
        </Card>
      )}

      {d.recommended_industries && (
        <Recommendations data={d.recommended_industries} areaCode={areaCode} areaName={areaName} onPick={startWith} />
      )}

      {d.area_compare && <CompareBlock data={d.area_compare} />}

      {d.franchise && <FranchiseBlock data={d.franchise} />}

      {d.notice && <p className="text-[11px] leading-relaxed text-ink-400">{d.notice}</p>}
    </section>
  );
}
