import { BUDGET_MAX } from "./analysis.data";

type BudgetValue = {
    depositMin: number;
    depositMax: number;
    monthlyRentMax: number | null;
    interiorBudgetMax: number | null;
};
type BudgetFormProps = { value: BudgetValue; onChange: (v: BudgetValue) => void };

const THUMB = "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-main [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-main [&::-moz-range-thumb]:bg-white";

const toNumber = (text: string) => Math.max(0, Number(text.replace(/[^0-9]/g, "")) || 0);

export default function BudgetForm({ value, onChange }: BudgetFormProps) {
    const set = (patch: Partial<BudgetValue>) => onChange({ ...value, ...patch });
    const left = (value.depositMin / BUDGET_MAX) * 100;
    const right = (Math.min(value.depositMax, BUDGET_MAX) / BUDGET_MAX) * 100;

    return (
        <div>
            <div className="flex items-end justify-between">
                <p className="text-[15px] font-semibold text-ink-800">보증금</p>
                <p className="text-[22px] font-bold text-main">
                    {value.depositMin.toLocaleString()} ~ {value.depositMax.toLocaleString()}만원
                </p>
            </div>
            <div className="mt-3 flex items-center gap-3">
                <MoneyInput value={value.depositMin} onChange={(n) => set({ depositMin: Math.min(n, value.depositMax) })} />
                <span className="text-ink-300">–</span>
                <MoneyInput value={value.depositMax} onChange={(n) => set({ depositMax: Math.max(n, value.depositMin) })} />
            </div>

            <div className="relative mt-5 h-5">
                <div className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 bg-line" />
                <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-main" style={{ left: `${left}%`, width: `${right - left}%` }} />
                {(["depositMin", "depositMax"] as const).map((key) => (
                    <input
                        key={key}
                        type="range"
                        min={0}
                        max={BUDGET_MAX}
                        step={100}
                        value={Math.min(value[key], BUDGET_MAX)}
                        aria-label={key === "depositMin" ? "보증금 최소" : "보증금 최대"}
                        onChange={(e) => {
                            const n = Number(e.target.value);
                            if (key === "depositMin") set({ depositMin: Math.min(n, value.depositMax) });
                            else set({ depositMax: Math.max(n, value.depositMin) });
                        }}
                        className={`pointer-events-none absolute inset-0 w-full appearance-none bg-transparent ${THUMB}`}
                    />
                ))}
            </div>
            <p className="mt-1 text-[12px] text-ink-300">0만원</p>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <LaterField
                    label="월 임대료 상한"
                    value={value.monthlyRentMax}
                    onChange={(n) => set({ monthlyRentMax: n })}
                    placeholder={300}
                />
                <LaterField
                    label="인테리어 · 설비"
                    value={value.interiorBudgetMax}
                    onChange={(n) => set({ interiorBudgetMax: n })}
                    placeholder={500}
                />
            </div>
        </div>
    );
}

function MoneyInput({ value, onChange, disabled, placeholder, emptyWhenZero }: {
    value: number | null; onChange: (n: number) => void; disabled?: boolean; placeholder?: number;
    emptyWhenZero?: boolean;
}) {
    return (
        <label className={`flex flex-1 items-center gap-2 rounded-lg border border-line px-4 py-3 ${disabled ? "bg-surface" : "bg-white"}`}>
            <input
                inputMode="numeric"
                disabled={disabled}
                value={value === null || (emptyWhenZero && value === 0) ? "" : value.toLocaleString()}
                placeholder={placeholder?.toLocaleString()}
                onChange={(e) => onChange(toNumber(e.target.value))}
                className="w-full bg-transparent text-right text-[16px] font-semibold text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-200"
            />
            <span className="shrink-0 text-[14px] text-ink-300">만원</span>
        </label>
    );
}

function LaterField({ label, value, onChange, placeholder }: {
    label: string; value: number | null; onChange: (n: number | null) => void; placeholder: number;
}) {
    const later = value === null;
    return (
        <div>
            <p className="mb-2 text-[15px] font-semibold text-ink-800">{label}</p>
            <MoneyInput value={value} onChange={onChange} disabled={later} placeholder={placeholder} emptyWhenZero />
            <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-[14px] text-ink-500">
                <input
                    type="checkbox"
                    checked={later}
                    onChange={(e) => onChange(e.target.checked ? null : 0)}
                    className="size-4 accent-main"
                />
                나중에 정할게요
            </label>
        </div>
    );
}
