import { useInView } from "@/app/(protected)/report-job/_components/Reveal";
import type { ChartItem, CompareRow, TrendPoint } from "@/types/analysis-result";
import { BAR_DELAY, BAR_WIDTH } from "../ScoreBar";

// 결과 화면용 간단한 차트들. 외부 차트 라이브러리 없이 막대(div)로만 그린다.
// 화면에 들어오면 가로 막대는 왼쪽에서 오른쪽으로, 세로 막대는 아래에서 위로 쭉 차오른다.

const pct = (v: number) => `${Math.round(v)}%`;
const clampPercent = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

// 세로 막대 높이(0~100%)별 클래스. Tailwind는 클래스를 문자열 그대로 찾기 때문에 미리 적어 둔다.
const BAR_HEIGHT = [
  "h-0", "h-[1%]", "h-[2%]", "h-[3%]", "h-[4%]", "h-[5%]", "h-[6%]", "h-[7%]", "h-[8%]", "h-[9%]",
  "h-[10%]", "h-[11%]", "h-[12%]", "h-[13%]", "h-[14%]", "h-[15%]", "h-[16%]", "h-[17%]",
  "h-[18%]", "h-[19%]", "h-[20%]", "h-[21%]", "h-[22%]", "h-[23%]", "h-[24%]", "h-[25%]",
  "h-[26%]", "h-[27%]", "h-[28%]", "h-[29%]", "h-[30%]", "h-[31%]", "h-[32%]", "h-[33%]",
  "h-[34%]", "h-[35%]", "h-[36%]", "h-[37%]", "h-[38%]", "h-[39%]", "h-[40%]", "h-[41%]",
  "h-[42%]", "h-[43%]", "h-[44%]", "h-[45%]", "h-[46%]", "h-[47%]", "h-[48%]", "h-[49%]",
  "h-[50%]", "h-[51%]", "h-[52%]", "h-[53%]", "h-[54%]", "h-[55%]", "h-[56%]", "h-[57%]",
  "h-[58%]", "h-[59%]", "h-[60%]", "h-[61%]", "h-[62%]", "h-[63%]", "h-[64%]", "h-[65%]",
  "h-[66%]", "h-[67%]", "h-[68%]", "h-[69%]", "h-[70%]", "h-[71%]", "h-[72%]", "h-[73%]",
  "h-[74%]", "h-[75%]", "h-[76%]", "h-[77%]", "h-[78%]", "h-[79%]", "h-[80%]", "h-[81%]",
  "h-[82%]", "h-[83%]", "h-[84%]", "h-[85%]", "h-[86%]", "h-[87%]", "h-[88%]", "h-[89%]",
  "h-[90%]", "h-[91%]", "h-[92%]", "h-[93%]", "h-[94%]", "h-[95%]", "h-[96%]", "h-[97%]",
  "h-[98%]", "h-[99%]", "h-full",
];

// 세로 막대가 왼쪽부터 차례로 올라오는 지연 (칸 번호 × 25ms, 24칸까지)
const COLUMN_DELAY = [
  "delay-0", "delay-[25ms]", "delay-[50ms]", "delay-[75ms]", "delay-[100ms]", "delay-[125ms]",
  "delay-[150ms]", "delay-[175ms]", "delay-[200ms]", "delay-[225ms]", "delay-[250ms]",
  "delay-[275ms]", "delay-[300ms]", "delay-[325ms]", "delay-[350ms]", "delay-[375ms]",
  "delay-[400ms]", "delay-[425ms]", "delay-[450ms]", "delay-[475ms]", "delay-[500ms]",
  "delay-[525ms]", "delay-[550ms]", "delay-[575ms]", "delay-[600ms]",
];

const FILL_MOTION =
  "duration-900 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-none";
const pick = <T,>(table: T[], index: number) => table[Math.min(index, table.length - 1)];

// 매출·손님은 밝은 파랑, 유동인구는 민트. 가장 큰 항목만 진하게
const TONE = {
  sales: { top: "bg-main-dark", rest: "bg-point-blue", text: "text-point-blue", glow: "from-point-blue-50" },
  foot: { top: "bg-sub-600", rest: "bg-point-mint", text: "text-sub-700", glow: "from-sub-50" },
} as const;
type Tone = keyof typeof TONE;

// 가로 막대 목록 (요일별 매출, 연령대별 손님 등). 가장 큰 항목을 진하게 강조한다.
export function BarList({ items, tone = "sales" }: { items: ChartItem[]; tone?: Tone }) {
  const { ref, inView } = useInView<HTMLUListElement>(0.7);
  const max = Math.max(...items.map((i) => i.value), 1);
  const top = items.reduce((a, b) => (b.value > a.value ? b : a), items[0]);
  const color = TONE[tone];

  return (
    <ul ref={ref} className="space-y-2.5">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center gap-3 text-sm">
          <span className="w-14 shrink-0 text-ink-700">{item.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line-light">
            <div
              className={`h-full rounded-full transition-[width] ${FILL_MOTION} ${item === top ? color.top : color.rest} ${
                BAR_WIDTH[inView ? clampPercent((item.value / max) * 100) : 0]
              } ${pick(BAR_DELAY, index)}`}
            />
          </div>
          <span className={`w-10 text-right font-bold ${color.text}`}>{pct(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}

// 두 항목의 비중을 한 줄로 이어 붙인 막대 (성별). 항목이 둘이 아니면 가로 막대 목록으로 보여준다
export function SplitBar({ items }: { items: ChartItem[] }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.7);
  if (items.length !== 2) return <BarList items={items} />;
  const first = clampPercent(items[0].value);

  return (
    <div ref={ref} className="flex h-10 overflow-hidden rounded-xl bg-line-light text-sm font-bold text-white">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`flex items-center overflow-hidden whitespace-nowrap transition-[width] delay-[250ms] ${FILL_MOTION} ${
            index === 0 ? "bg-point-blue" : "justify-end bg-point-mint text-main-dark"
          } ${BAR_WIDTH[inView ? (index === 0 ? first : 100 - first) : 0]}`}
        >
          <span className="px-3">
            {item.label} {pct(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// 세로 막대 (시간대별 매출·유동인구처럼 칸이 많을 때)
export function ColumnChart({ items, tone = "sales" }: { items: ChartItem[]; tone?: Tone }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.7);
  const max = Math.max(...items.map((i) => i.value), 1);
  const top = items.reduce((a, b) => (b.value > a.value ? b : a), items[0]);
  const color = TONE[tone];

  return (
    <div ref={ref} className="flex h-40 items-end">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 rounded-t-md ${
            item === top ? `bg-linear-to-t to-transparent ${color.glow}` : ""
          }`}
        >
          <span className={`text-[11px] font-bold ${color.text}`}>{pct(item.value)}</span>
          <div
            className={`w-3/5 max-w-7 rounded-t-[3px] transition-[height] ${FILL_MOTION} ${item === top ? color.top : color.rest} ${
              BAR_HEIGHT[inView ? clampPercent((item.value / max) * 76) : 0]
            } ${pick(COLUMN_DELAY, index)}`}
          />
          <span className="w-full truncate border-t border-line pt-1 text-center text-[11px] text-ink-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// 분기별 개업·폐업 점포 수
export function OpenCloseChart({ points }: { points: TrendPoint[] }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.7);
  const max = Math.max(...points.flatMap((p) => [p.open, p.close]), 1);

  return (
    <div>
      <div className="mb-3 flex justify-end gap-4 text-xs text-ink-500">
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-[3px] bg-point-mint" /> 개업
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-[3px] bg-danger" /> 폐업
        </span>
      </div>
      <div ref={ref} className="flex h-40 items-end">
        {points.map((p, index) => (
          <div key={p.quarter} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <div className="flex min-h-0 w-full flex-1 items-end justify-center gap-1.5">
              {[
                { v: p.open, color: "bg-point-mint", text: "text-sub-700" },
                { v: p.close, color: "bg-danger", text: "text-danger-strong" },
              ].map(({ v, color, text }) => (
                <div key={color} className="flex h-full w-6 flex-col items-center justify-end gap-1">
                  <span className={`text-[11px] font-bold ${text}`}>{v}</span>
                  <div
                    className={`w-full rounded-t-[3px] transition-[height] ${FILL_MOTION} ${color} ${
                      BAR_HEIGHT[inView ? clampPercent((v / max) * 76) : 0]
                    } ${pick(BAR_DELAY, index)}`}
                  />
                </div>
              ))}
            </div>
            <span className="w-full border-t border-line pt-1 text-center text-[11px] text-ink-500">{p.quarter}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface MetricSeries {
  name: string;
  value: number | null;
  text: string; // 화면에 쓰는 값
  color: string; // 막대 색 클래스
}

// 항목 하나를 여러 대상(이 상권, 평균 등)의 가로 막대로 비교한다. 가장 큰 값이 막대 끝까지 간다
export function MetricBars({ label, note, warn, series }: { label: string; note?: string; warn?: boolean; series: MetricSeries[] }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.7);
  const max = Math.max(...series.map((s) => s.value ?? 0), 0);

  return (
    <div ref={ref} className="space-y-2 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-main-dark">{label}</p>
        {note && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${warn ? "bg-danger-bg text-danger-strong" : "bg-point-blue-50 text-point-blue"}`}
          >
            {note}
          </span>
        )}
      </div>
      {series.map((s, index) => (
        <div key={s.name} className="flex items-center gap-3 text-xs">
          <span className={`w-20 shrink-0 truncate ${index === 0 ? "font-bold text-point-blue" : "text-ink-500"}`}>{s.name}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line-light">
            <div
              className={`h-full rounded-full transition-[width] ${FILL_MOTION} ${s.color} ${
                BAR_WIDTH[inView && max > 0 ? clampPercent(((s.value ?? 0) / max) * 100) : 0]
              } ${pick(BAR_DELAY, index)}`}
            />
          </div>
          <span className={`w-24 shrink-0 text-right ${index === 0 ? "font-bold text-ink-900" : "text-ink-500"}`}>{s.text}</span>
        </div>
      ))}
    </div>
  );
}

// 같은 구·업종 평균과 비교
export function CompareTable({ rows }: { rows: CompareRow[] }) {
  return (
    <div className="divide-y divide-line-light">
      {rows.map((row) => (
        <MetricBars
          key={row.label}
          label={row.label}
          note={row.note}
          // 폐업 관련 항목이 평균보다 높으면 주의 색
          warn={row.label.includes("폐업") && row.mineValue > row.averageValue}
          series={[
            { name: "이 상권", value: row.mineValue, text: row.mine, color: "bg-point-blue" },
            { name: "평균", value: row.averageValue, text: row.average, color: "bg-ink-300/60" },
          ]}
        />
      ))}
    </div>
  );
}
