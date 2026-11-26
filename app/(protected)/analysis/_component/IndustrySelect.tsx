import type { IndustryStatus } from "@/api/analysis/analysis.api";
import { INDUSTRIES, INDUSTRY_STATUS_TEXT } from "./analysis.data";

type IndustryValue = { large: string; mid: string; small: string };
type IndustrySelectProps = {
    value: IndustryValue;
    onChange: (v: IndustryValue) => void;
    // 선택한 상권 기준으로 업종의 분석 가능 여부를 알려 준다 (모르면 undefined → 표시 안 함)
    statusOf?: (large: string, mid: string, small: string) => IndustryStatus | undefined;
};

const STATUS_BADGE: Record<IndustryStatus, string> = {
    analyzed: "bg-sub-50 text-sub-700",
    noRecord: "bg-surface text-ink-400",
    unsupported: "bg-surface text-ink-400",
};

export default function IndustrySelect({ value, onChange, statusOf }: IndustrySelectProps) {
    const larges = Object.keys(INDUSTRIES);
    const mids = value.large ? Object.keys(INDUSTRIES[value.large]) : [];
    const smalls = value.large && value.mid ? INDUSTRIES[value.large][value.mid] : [];

    const columns = [
        { title: "대분류", items: larges, selected: value.large, hasNext: true,
          pick: (v: string) => onChange({ large: v, mid: "", small: "" }) },
        { title: "중분류", items: mids, selected: value.mid, hasNext: true,
          pick: (v: string) => onChange({ ...value, mid: v, small: "" }) },
        { title: "소분류", items: smalls, selected: value.small, hasNext: false,
          pick: (v: string) => onChange({ ...value, small: v }) },
    ];

    const selectedStatus = value.small ? statusOf?.(value.large, value.mid, value.small) : undefined;

    return (
        <div>
            <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-line">
                {columns.map((col, i) => (
                    <div key={col.title} className={`min-h-[260px] ${i > 0 ? "border-l border-line" : ""}`}>
                        <p className="border-b border-line px-6 py-4 text-[14px] font-semibold text-ink-700">{col.title}</p>
                        <ul className="py-2">
                            {col.items.map((item) => {
                                const selected = col.selected === item;
                                // 상태는 소분류 칸에만 붙인다
                                const status = !col.hasNext ? statusOf?.(value.large, value.mid, item) : undefined;
                                return (
                                    <li key={item}>
                                        <button
                                            type="button"
                                            onClick={() => col.pick(item)}
                                            className={`flex w-full items-center justify-between gap-2 border-l-2 px-6 py-2.5 text-left text-[15px] ${
                                                selected
                                                    ? col.hasNext
                                                        ? "border-main bg-surface font-semibold text-ink-900"
                                                        : "border-sub bg-sub-50 font-semibold text-ink-900"
                                                    : "border-transparent text-ink-500 hover:bg-surface-light"
                                            }`}
                                        >
                                            <span className="min-w-0 truncate">{item}</span>
                                            <span className="flex shrink-0 items-center gap-1.5">
                                                {status && (
                                                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE[status]}`}>
                                                        {INDUSTRY_STATUS_TEXT[status].short}
                                                    </span>
                                                )}
                                                {selected && <span className={col.hasNext ? "text-ink-500" : "text-sub-700"}>{col.hasNext ? "›" : "✓"}</span>}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[14px]">
                <p className="text-ink-400">
                    선택한 업종{" "}
                    <b className="ml-2 text-sub-700">
                        {[value.large, value.mid, value.small].filter(Boolean).join(" › ") || "-"}
                    </b>
                    {selectedStatus && (
                        <span className="ml-3 text-[13px] text-ink-500">· {INDUSTRY_STATUS_TEXT[selectedStatus].full}</span>
                    )}
                </p>
                {value.large && (
                    <button type="button" onClick={() => onChange({ large: "", mid: "", small: "" })} className="font-semibold text-ink-800 underline">
                        다시 고르기
                    </button>
                )}
            </div>
        </div>
    );
}
