import type { StoresState } from "../useAreaStores";
import { formatQuarter } from "../analysisResult.mapper";

// "202609" → "2026년 9월"
export function formatDataMonth(month: string): string {
  const m = month.match(/^(\d{4})(\d{2})$/);
  return m ? `${m[1]}년 ${Number(m[2])}월` : month;
}

// +1 / -1 / 0
const signed = (n: number) => (n > 0 ? `+${n}` : String(n));

// 지금 이 상권에 있는 같은 업종 점포 현황. 점수를 낼 수 없는 업종(noData)이어도 보여준다.
// 프랜차이즈 여부는 서버가 추정한 값이라 "~로 보이는"으로 쓰고, 하단 안내 문구(notice)를 그대로 작게 보여준다.
export default function StoreCompetitionCard({ stores }: { stores: StoresState }) {
  if (stores.isLoading) {
    return (
      <div role="status" className="space-y-3 rounded-xl border border-line p-4">
        <p className="flex items-center gap-2 text-sm text-ink-500">
          <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-line border-t-sub" />
          점포 정보를 불러오는 중이에요
        </p>
        <p className="text-xs text-ink-400">처음 보는 상권은 몇 초 걸릴 수 있어요.</p>
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-surface" />
          <div className="h-4 w-1/2 rounded bg-surface" />
        </div>
      </div>
    );
  }

  if (stores.errorMessage) {
    return (
      <p role="status" className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-400">
        {stores.errorMessage}
      </p>
    );
  }

  const data = stores.data;
  if (!data) return null;
  const s = data.summary;

  return (
    <div className="space-y-3 rounded-xl border border-line p-4 text-sm text-ink-800">
      <p className="font-bold text-ink-900">
        현재 {data.industry_name} {s.same_industry_count}곳
        <span className="ml-1 font-normal text-ink-500">
          (일반 {s.independent_count} · 프랜차이즈로 보이는 점포 {s.franchise_count})
        </span>
      </p>

      <ul className="space-y-1.5">
        <li>
          그중 1층 {s.first_floor_count}곳
          {s.first_floor_ratio != null && ` (${Math.round(s.first_floor_ratio * 100)}%)`}
        </li>
        {s.model_store_count != null && (
          <li>
            모델 기준({formatQuarter(s.model_base_quarter)}) {s.model_store_count}곳 → 현재 {s.same_industry_count}곳
            {s.change_vs_model != null && ` (${signed(s.change_vs_model)}곳)`}
          </li>
        )}
        {s.same_brand_count != null && <li>같은 브랜드 {s.same_brand_count}곳</li>}
        <li className="text-ink-500">이 상권 전체 점포 {s.total_store_count}곳</li>
      </ul>

      <div className="space-y-0.5 border-t border-line pt-3 text-[11px] leading-relaxed text-ink-400">
        <p>{formatDataMonth(data.data_month)} 기준</p>
        {data.notice && <p>{data.notice}</p>}
      </div>
    </div>
  );
}
