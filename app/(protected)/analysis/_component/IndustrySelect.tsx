import { INDUSTRIES } from "./analysis.data";

type IndustryValue = { large: string; mid: string; small: string };
type IndustrySelectProps = { value: IndustryValue; onChange: (v: IndustryValue) => void };

export default function IndustrySelect({ value, onChange }: IndustrySelectProps) {
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

    return (
        <div>
            <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-line">
                {columns.map((col, i) => (
                    <div key={col.title} className={`min-h-[260px] ${i > 0 ? "border-l border-line" : ""}`}>
                        <p className="border-b border-line px-6 py-4 text-[14px] font-semibold text-ink-700">{col.title}</p>
                        <ul className="py-2">
                            {col.items.map((item) => {
                                const selected = col.selected === item;
                                return (
                                    <li key={item}>
                                        <button
                                            type="button"
                                            onClick={() => col.pick(item)}
                                            className={`flex w-full items-center justify-between border-l-2 px-6 py-2.5 text-left text-[15px] ${
                                                selected
                                                    ? col.hasNext
                                                        ? "border-main bg-surface font-semibold text-ink-900"
                                                        : "border-sub bg-sub-50 font-semibold text-ink-900"
                                                    : "border-transparent text-ink-500 hover:bg-surface-light"
                                            }`}
                                        >
                                            {item}
                                            {selected && <span className={col.hasNext ? "text-ink-500" : "text-sub-700"}>{col.hasNext ? "›" : "✓"}</span>}
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
