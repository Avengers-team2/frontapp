import { useEffect, useRef, useState } from "react";
import ScoreSummary from "../ScoreSummary";
import { useInView } from "@/app/(protected)/report-job/_components/Reveal";
import type { ChartItem, PreStartupResultView } from "@/types/analysis-result";
import { BarList, ColumnChart, CompareTable, OpenCloseChart } from "./charts";
import InfoPanel from "./InfoPanel";
import InsightsSection from "./InsightsSection";
import StoreCompetitionCard from "./StoreCompetitionCard";
import type { InsightsState } from "../useAnalysisInsights";
import type { StoresState } from "../useAreaStores";

interface PreStartupResultProps {
  result: PreStartupResultView;
  stores?: StoresState; // 지금 점포 현황 (지도 마커와 같은 데이터)
  insights?: InsightsState; // 추가 정보 (따로 불러와서 이 영역만 스켈레톤을 보여준다)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      {children}
    </section>
  );
}

// 서버가 준 문장 목록 (위험 요인, 개선 방향)
function SentenceList({ items, marker }: { items: string[]; marker: string }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-ink-800">
      {items.map((text, i) => (
        <li key={i} className="flex gap-2">
          <span aria-hidden="true" className={`mt-0.5 shrink-0 ${marker}`}>
            •
          </span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-medium text-ink-500">{children}</p>;
}

// 주행 거리계 숫자: 자리마다 0~9가 두 번 쌓인 띠(20칸)를 굴려 제 숫자에서 멈춘다.
// Tailwind는 클래스를 문자열 그대로 찾기 때문에, 칸 위치(0~19)와 자리별 지연은 미리 적어 둔 표에서 고른다.
const STRIP_DIGITS = [...Array(20)].map((_, i) => i % 10);
const STRIP_SHIFT = [
  "translate-y-0",
  "-translate-y-[5%]",
  "-translate-y-[10%]",
  "-translate-y-[15%]",
  "-translate-y-[20%]",
  "-translate-y-[25%]",
  "-translate-y-[30%]",
  "-translate-y-[35%]",
  "-translate-y-[40%]",
  "-translate-y-[45%]",
  "-translate-y-[50%]",
  "-translate-y-[55%]",
  "-translate-y-[60%]",
  "-translate-y-[65%]",
  "-translate-y-[70%]",
  "-translate-y-[75%]",
  "-translate-y-[80%]",
  "-translate-y-[85%]",
  "-translate-y-[90%]",
  "-translate-y-[95%]",
];
const STRIP_DELAY = [
  "delay-0",
  "delay-[70ms]",
  "delay-[140ms]",
  "delay-[210ms]",
  "delay-[280ms]",
  "delay-[350ms]",
  "delay-[420ms]",
  "delay-[490ms]",
];

// start: 굴리기 시작할 칸. 처음엔 0칸(숫자 0), 다시 굴릴 땐 제 숫자 칸에서 출발한다.
function OdometerDigit({ digit, order, start, go }: { digit: number; order: number; start: number; go: boolean }) {
  const [rolled, setRolled] = useState(false);

  // 첫 모습(start 칸)이 먼저 그려진 뒤에 이동해야 전환이 걸린다. 그래서 프레임을 두 번 기다린다.
  useEffect(() => {
    if (!go) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setRolled(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [go]);

  const shift = STRIP_SHIFT[rolled ? digit + 10 : start];
  const delay = STRIP_DELAY[Math.min(order, STRIP_DELAY.length - 1)];

  return (
    <span className="block h-7 overflow-hidden">
      <span
        className={`flex flex-col transition-transform duration-1300 ease-[cubic-bezier(0.25,1.12,0.4,1)] motion-reduce:transition-none ${shift} ${delay}`}
      >
        {STRIP_DIGITS.map((d, i) => (
          <b key={i} className="block h-7 text-center font-bold leading-7">
            {d}
          </b>
        ))}
      </span>
    </span>
  );
}

// 숫자가 아닌 글자(쉼표, 점, %, 단위)는 그대로 두고, 숫자 자리만 굴린다.
function OdometerValue({ value, go, replay }: { value: string; go: boolean; replay: number }) {
  let order = 0;
  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="flex h-7 items-center tabular-nums">
        {value.split("").map((ch, i) =>
          /\d/.test(ch) ? (
            <OdometerDigit
              key={`${replay}-${i}`}
              digit={Number(ch)}
              order={order++}
              start={replay === 0 ? 0 : Number(ch)}
              go={go}
            />
          ) : (
            <i key={`${replay}-${i}`} className="not-italic">
              {ch}
            </i>
          )
        )}
      </span>
    </>
  );
}

function StatCell({ stat, inView }: { stat: { label: string; value: string; note?: string }; inView: boolean }) {
  const [replay, setReplay] = useState(0);
  const lastRoll = useRef(0);

  // 포인터를 올리면 한 바퀴 더 굴린다 (굴러가는 중에는 무시)
  const handleEnter = () => {
    if (!inView || Date.now() - lastRoll.current < 900) return;
    lastRoll.current = Date.now();
    setReplay((n) => n + 1);
  };

  return (
    <div className="space-y-1 bg-white p-4" onPointerEnter={handleEnter}>
      <p>{stat.label}</p>
      <p className="text-lg font-bold text-ink-900">
        <OdometerValue value={stat.value} go={inView} replay={replay} />
      </p>
      {stat.note && <p className="text-sub-700">{stat.note}</p>}
    </div>
  );
}

// 통계 칸들 (3열). 칸 사이는 얇은 선으로 나눈다. 화면에 들어오면 숫자가 굴러간다.
function StatGrid({ stats }: { stats: { label: string; value: string; note?: string }[] }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);

  return (
    <div
      ref={ref}
      className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line text-xs text-ink-500"
    >
      {stats.map((stat) => (
        <StatCell key={stat.label} stat={stat} inView={inView} />
      ))}
      {/* 3열이 안 채워지면 빈 칸을 흰색으로 채운다 */}
      {Array.from({ length: (3 - (stats.length % 3)) % 3 }).map((_, i) => (
        <div key={`empty-${i}`} className="bg-white" />
      ))}
    </div>
  );
}

const has = (items?: ChartItem[]) => !!items && items.length > 0;

export default function PreStartupResult({ result, stores, insights }: PreStartupResultProps) {
  const { evidence, footTraffic } = result;
  const hasSales = has(result.salesByWeekday) || has(result.salesByHour);
  const hasCustomer = has(result.customerByAge) || has(result.customerByGender);
  const hasFoot = !!footTraffic && (has(footTraffic.byAge) || has(footTraffic.byHour) || has(footTraffic.byWeekday));

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-sm text-ink-600">
        <h2 className="text-2xl font-bold text-ink-900">{result.title}</h2>
        {result.conditionSummary && <p>{result.conditionSummary}</p>}
        <p className="font-bold text-ink-800">{result.caveat}</p>
      </header>

      {result.notice && (
        <p className="rounded-xl bg-sub-50 px-4 py-3 text-sm font-medium leading-relaxed text-sub-700">{result.notice}</p>
      )}
      {result.staleNotice && (
        <p className="rounded-xl bg-warning/20 px-4 py-3 text-sm font-medium text-warning-text">{result.staleNotice}</p>
      )}

      <ScoreSummary
        totalScore={result.totalScore}
        scoreLabel={result.scoreLabel}
        reliabilityLabel={result.reliabilityLabel}
        riskLabel={result.riskLabel}
        riskTone={result.riskTone}
        headline={result.headline}
        description={result.description}
        scoreItems={result.scoreItems}
      />

      {result.kind === "normal" && (
        <p className="-mt-4 text-[11px] leading-relaxed text-ink-400">
          점수는 같은 업종 안에서의 상대 순위를 바탕으로 해요. 정확한 성공 가능성을 뜻하지는 않아요.
        </p>
      )}

      {result.kind === "noData" && (
        <InfoPanel
          infoPanel={result.infoPanel}
          referenceSales={result.referenceSales}
          dataQuarterLabel={result.dataQuarterLabel}
        />
      )}

      {result.rankLabel && (
        <div className="rounded-xl border border-line p-4 text-sm">
          <p className="text-sub-700">{result.rankLabel}</p>
        </div>
      )}

      {/* 지금 이 상권의 같은 업종 점포 현황 (점수가 없는 noData 에서도 보여준다) */}
      {stores && (stores.isLoading || stores.errorMessage || stores.data) && (
        <Section title="지금 점포 현황">
          <StoreCompetitionCard stores={stores} />
        </Section>
      )}

      {evidence.stats.length > 0 && (
        <Section title={evidence.title}>
          <StatGrid stats={evidence.stats} />
        </Section>
      )}

      {result.competition && (
        <Section title="경쟁 현황">
          <StatGrid stats={result.competition} />
        </Section>
      )}

      {hasSales && (
        <Section title="매출 분석">
          {has(result.salesByWeekday) && (
            <div>
              <SubTitle>요일별 매출 비중</SubTitle>
              <BarList items={result.salesByWeekday!} />
            </div>
          )}
          {has(result.salesByHour) && (
            <div className="pt-2">
              <SubTitle>시간대별 매출 비중</SubTitle>
              <ColumnChart items={result.salesByHour!} />
            </div>
          )}
        </Section>
      )}

      {hasCustomer && (
        <Section title="손님 구성">
          {has(result.customerByAge) && (
            <div>
              <SubTitle>연령대별 손님 비중</SubTitle>
              <BarList items={result.customerByAge!} />
            </div>
          )}
          {has(result.customerByGender) && (
            <div className="pt-2">
              <SubTitle>성별 손님 비중</SubTitle>
              <BarList items={result.customerByGender!} />
            </div>
          )}
        </Section>
      )}

      {hasFoot && (
        <Section title="유동인구">
          {has(footTraffic.byAge) && (
            <div>
              <SubTitle>연령대별</SubTitle>
              <BarList items={footTraffic.byAge!} />
            </div>
          )}
          {has(footTraffic.byHour) && (
            <div className="pt-2">
              <SubTitle>시간대별</SubTitle>
              <ColumnChart items={footTraffic.byHour!} />
            </div>
          )}
          {has(footTraffic.byWeekday) && (
            <div className="pt-2">
              <SubTitle>요일별</SubTitle>
              <BarList items={footTraffic.byWeekday!} />
            </div>
          )}
        </Section>
      )}

      {result.openCloseTrend && (
        <Section title="개업 · 폐업 추이 (최근 4분기)">
          <OpenCloseChart points={result.openCloseTrend} />
        </Section>
      )}

      {result.compareAverage && (
        <Section title="같은 구 · 업종 평균과 비교">
          <CompareTable rows={result.compareAverage} />
        </Section>
      )}

      {result.risks.length > 0 && (
        <Section title="위험 요인">
          <SentenceList items={result.risks} marker="text-danger-strong" />
        </Section>
      )}

      {result.improvements.length > 0 && (
        <Section title="개선 방향">
          <SentenceList items={result.improvements} marker="text-sub-700" />
        </Section>
      )}

      {/* 추가 정보: 점수 화면을 먼저 그리고 따로 불러온다 (업종 순위, 매출 추세, 다른 업종 추천, 상권 비교, 프랜차이즈 비중) */}
      {insights && <InsightsSection insights={insights} />}

      {/* 예측 매출은 오차가 커서 강조하지 않고, 맨 아래에 작게 참고용으로만 둔다 */}
      {result.prediction && (
        <p className="text-xs leading-relaxed text-ink-400">
          참고용 예측 · {result.prediction.quarter} 분기 매출 합계 약 {result.prediction.value}
          {result.prediction.changeRate && ` (${result.prediction.changeRate})`} · 데이터 기준 {result.prediction.baseQuarter}
        </p>
      )}
    </div>
  );
}
