import type { InfoPanel as InfoPanelData, ReferenceSales, SimilarAreas } from "@/types/analysis";
import { formatKRW } from "../analysisResult.mapper";

// 점수를 낼 수 없는 조합(noData)에서 점수 대신 보여주는 정보판.
// 값은 모델 예측이 아니라 최근 분기의 실제 데이터이거나 비슷한 상권 요약이다. 값이 null 이면 그 섹션은 숨긴다.

const percent = (ratio: number) => `${Math.round(ratio * 100)}%`;
const rate = (v: number | null | undefined) => (v == null ? "-" : `${v}%`);

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-ink-900">{title}</h3>
        {sub && <span className="text-xs text-ink-400">{sub}</span>}
      </div>
      {children}
    </section>
  );
}

type Tile = { label: string; value: string };

// 칸 사이를 얇은 선으로 나누는 3열 표 (빈 칸은 흰색으로 채운다)
function TileGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line text-xs text-ink-500">
      {tiles.map((t) => (
        <div key={t.label} className="space-y-1 bg-white p-4">
          <p>{t.label}</p>
          <p className="text-base font-bold text-ink-900">{t.value}</p>
        </div>
      ))}
      {Array.from({ length: (3 - (tiles.length % 3)) % 3 }).map((_, i) => (
        <div key={`empty-${i}`} className="bg-white" />
      ))}
    </div>
  );
}

function AreaProfileSection({ profile }: { profile: NonNullable<InfoPanelData["areaProfile"]> }) {
  const pop = profile.floatingPopulation;
  const tiles: Tile[] = [];
  if (pop?.total != null) tiles.push({ label: "유동인구", value: `${pop.total.toLocaleString()}명` });
  if (pop?.topAgeGroup) tiles.push({ label: "주요 연령대", value: `${pop.topAgeGroup.name} (${percent(pop.topAgeGroup.share)})` });
  if (pop?.busiestTimeBand)
    tiles.push({ label: "붐비는 시간대", value: `${pop.busiestTimeBand.name} (${percent(pop.busiestTimeBand.share)})` });
  if (pop?.weekendShare != null) tiles.push({ label: "주말 비중", value: percent(pop.weekendShare) });
  if (profile.operatingMonthsAvg != null)
    tiles.push({ label: "평균 운영 영업 개월", value: `${profile.operatingMonthsAvg}개월` });
  if (profile.closedMonthsAvg != null)
    tiles.push({ label: "평균 폐업 영업 개월", value: `${profile.closedMonthsAvg}개월` });

  const change = profile.changeIndicator;

  return (
    <Section title="상권 프로필">
      <div className="space-y-1 rounded-xl border border-line p-4 text-sm">
        <p className="font-bold text-ink-900">
          {[profile.areaName, profile.areaType].filter(Boolean).join(" · ")}
        </p>
        {change?.name && (
          <p className="text-ink-500">
            <span className="font-medium text-sub-700">{change.name}</span>
            {change.meaning && ` — ${change.meaning}`}
          </p>
        )}
      </div>
      {tiles.length > 0 && <TileGrid tiles={tiles} />}
    </Section>
  );
}

function OtherIndustriesSection({ data }: { data: NonNullable<InfoPanelData["otherIndustries"]> }) {
  if (data.items.length === 0) return null;
  return (
    <Section title="이 상권의 다른 업종" sub={data.basis === "sales" ? "매출 순" : "점포 수 순"}>
      <ol className="divide-y divide-line rounded-xl border border-line text-sm">
        {data.items.map((item, i) => (
          <li key={item.industryCode} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-5 shrink-0 text-xs font-bold text-ink-300">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-ink-900">{item.industryName ?? item.industryCode}</span>
            <span className="shrink-0 text-xs text-ink-500">
              점포 {item.storeCount ?? "-"}개 · 폐업률 {rate(item.closeRate)}
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function SimilarAreasSection({ data }: { data: SimilarAreas }) {
  const s = data.summary;
  const tiles: Tile[] = [];
  if (s.closeRateAvg != null) tiles.push({ label: "평균 폐업률", value: rate(s.closeRateAvg) });
  if (s.storeCountMedian != null) tiles.push({ label: "점포 수 (중앙값)", value: `${s.storeCountMedian}개` });
  if (s.openRateAvg != null) tiles.push({ label: "평균 개업률", value: rate(s.openRateAvg) });
  if (s.franchiseShare != null) tiles.push({ label: "프랜차이즈 비중", value: percent(s.franchiseShare) });
  if (s.topCustomerAge) tiles.push({ label: "주 고객 연령대", value: `${s.topCustomerAge.name} (${percent(s.topCustomerAge.share)})` });
  if (s.topSalesTimeBand)
    tiles.push({ label: "매출 많은 시간대", value: `${s.topSalesTimeBand.name} (${percent(s.topSalesTimeBand.share)})` });
  if (s.femaleShare != null) tiles.push({ label: "여성 고객 비중", value: percent(s.femaleShare) });

  return (
    <Section title="비슷한 상권" sub={`${s.count}곳 기준`}>
      {tiles.length > 0 && <TileGrid tiles={tiles} />}
      {data.top5.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-500">가장 비슷한 상권 {data.top5.length}곳</p>
          <ul className="space-y-2">
            {data.top5.map((area) => (
              <li key={area.areaCode} className="rounded-xl border border-line p-3 text-sm">
                <p className="font-bold text-ink-900">{area.areaName ?? area.areaCode}</p>
                <p className="mt-1 text-xs text-ink-500">
                  점포 {area.storeCount ?? "-"}개 · 폐업률 {rate(area.closeRate)}
                  {area.floatingPopulation != null && ` · 유동인구 ${area.floatingPopulation.toLocaleString()}명`}
                </p>
                {area.sales != null && (
                  <p className="mt-0.5 text-xs text-ink-500">분기 매출 합계 약 {formatKRW(area.sales)}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

function ReferenceSalesSection({ data }: { data: ReferenceSales }) {
  if (data.median == null) return null;
  return (
    <Section title="참고 매출">
      <div className="space-y-2 rounded-xl border border-line p-4 text-sm">
        <p className="font-bold text-ink-900">
          비슷한 상권의 같은 업종 분기 매출 합계 중앙값 약 {formatKRW(data.median)}
          {data.low != null && data.high != null && ` (범위 ${formatKRW(data.low)}~${formatKRW(data.high)})`}
        </p>
        <p className="text-xs text-ink-500">{data.basis}</p>
        <p className="text-xs font-bold text-danger-strong">이 상권의 예측 매출이 아닙니다. 금액은 분기(3개월) 매출 합계 기준이에요.</p>
      </div>
    </Section>
  );
}

interface InfoPanelProps {
  infoPanel?: InfoPanelData;
  referenceSales?: ReferenceSales;
  dataQuarterLabel: string;
}

export default function InfoPanel({ infoPanel, referenceSales, dataQuarterLabel }: InfoPanelProps) {
  const hasAny = !!infoPanel?.areaProfile || !!infoPanel?.otherIndustries || !!infoPanel?.similarAreas || !!referenceSales;
  if (!hasAny) return null;

  return (
    <div className="space-y-8">
      {infoPanel?.areaProfile && <AreaProfileSection profile={infoPanel.areaProfile} />}
      {infoPanel?.otherIndustries && <OtherIndustriesSection data={infoPanel.otherIndustries} />}
      {infoPanel?.similarAreas && <SimilarAreasSection data={infoPanel.similarAreas} />}
      {referenceSales && <ReferenceSalesSection data={referenceSales} />}
      <p className="text-[11px] leading-relaxed text-ink-400">
        이 정보판의 값은 모델 예측이 아니라 최근 분기({dataQuarterLabel})의 실제 데이터 또는 비슷한 상권 요약이에요.
      </p>
    </div>
  );
}
