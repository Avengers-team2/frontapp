import type { ChartItem, TrendPoint } from "@/types/analysis-result";

// 그래프 아래의 한 줄 요약. 그래프에 쓴 값에서 바로 만든다.

const pct = (v: number) => `${Math.round(v)}%`;
const hourText = (label: string) => `${label.replace(/시$/, "")}시`;
const dayText = (label: string) => `${label.replace(/요일$/, "")}요일`;
const topOf = (items: ChartItem[]) => items.reduce((a, b) => (b.value > a.value ? b : a), items[0]);

function Callout({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 rounded-2xl bg-point-blue-50 px-4 py-3 text-xs leading-relaxed text-ink-700">{children}</p>;
}

function Strong({ children }: { children: React.ReactNode }) {
  return <b className="text-point-blue">{children}</b>;
}

export function WeekdaySummary({ items, subject }: { items: ChartItem[]; subject: "매출" | "유동인구" }) {
  const top = topOf(items);
  return (
    <Callout>
      {dayText(top.label)} {subject} 비중이 <Strong>{pct(top.value)}</Strong>로 가장 높습니다.
    </Callout>
  );
}

// 매출이 몰리는 시간대. 유동인구 데이터가 있으면 가장 붐비는 시간대와 견준다
export function SalesHourSummary({ items, foot }: { items: ChartItem[]; foot?: ChartItem[] }) {
  const top = topOf(items);
  const busy = foot && foot.length > 0 ? topOf(foot) : undefined;
  return (
    <Callout>
      매출의 <Strong>{pct(top.value)}</Strong>가 {hourText(top.label)}에 발생합니다.
      {busy &&
        (busy.label === top.label
          ? ` 유동인구가 가장 많은 시간대(${pct(busy.value)})와 같습니다.`
          : ` 유동인구는 ${hourText(busy.label)}(${pct(busy.value)})에 가장 많습니다.`)}
    </Callout>
  );
}

export function FootHourSummary({ items }: { items: ChartItem[] }) {
  const top = topOf(items);
  return (
    <Callout>
      유동인구는 {hourText(top.label)}에 <Strong>{pct(top.value)}</Strong>로 가장 많습니다.
    </Callout>
  );
}

// 비중이 큰 두 연령대를 합쳐서 보여준다
export function AgeSummary({ items, subject }: { items: ChartItem[]; subject: "손님" | "유동인구" }) {
  const top = [...items].sort((a, b) => b.value - a.value).slice(0, 2);
  const names = items.filter((item) => top.includes(item)).map((item) => item.label);
  return (
    <Callout>
      {names.join("·")} {subject}
      {subject === "손님" ? "이" : "가"} 전체의 <Strong>{pct(top.reduce((sum, item) => sum + item.value, 0))}</Strong>를 차지합니다.
    </Callout>
  );
}

export function OpenCloseSummary({ points }: { points: TrendPoint[] }) {
  const open = points.reduce((sum, p) => sum + p.open, 0);
  const close = points.reduce((sum, p) => sum + p.close, 0);
  return (
    <Callout>
      최근 {points.length}분기 동안 개업 <Strong>{open}곳</Strong>, 폐업 <b className="text-danger-strong">{close}곳</b>입니다.
    </Callout>
  );
}
