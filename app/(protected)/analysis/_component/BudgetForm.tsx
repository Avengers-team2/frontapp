import { FieldMessage } from "@/components/form/FormMotion";
import { BUDGET_MAX } from "./analysis.data";
import DepositSlider from "./DepositSlider";

type BudgetValue = {
    depositMin: number;
    depositMax: number;
    monthlyRentMax: number | null;
    interiorBudgetMax: number | null;
};
type BudgetField = "deposit" | "rent" | "interior";
type BudgetFormProps = {
    value: BudgetValue;
    onChange: (v: BudgetValue) => void;
    // 빈 칸 표시 (흔들림·빨간 테두리·안내 문구). 안내 문구가 있으면 빨간 테두리다
    fieldId: (name: string) => string;
    shake: (name: BudgetField) => string;
    messageOf: (name: BudgetField) => string | null | undefined;
};

const TICKS = [0, 10000, 20000, 30000].map((t) => ({
    value: t,
    label: `${t === 0 ? "0원" : `${t / 10000}억`}${t === BUDGET_MAX ? "+" : ""}`,
}));

const formatMoney = (manwon: number) => {
    if (manwon === 0) return "0원";
    const eok = Math.floor(manwon / 10000);
    const rest = manwon % 10000;
    if (eok === 0) return `${rest.toLocaleString()}만원`;
    return rest === 0 ? `${eok}억원` : `${eok}억 ${rest.toLocaleString()}만원`;
};

const toNumber = (text: string) => Math.max(0, Number(text.replace(/[^0-9]/g, "")) || 0);

export default function BudgetForm({ value, onChange, fieldId, shake, messageOf }: BudgetFormProps) {
    const set = (patch: Partial<BudgetValue>) => onChange({ ...value, ...patch });

    return (
        <div>
            <div className="flex items-end justify-between">
                <p className="text-[15px] font-semibold text-ink-800">보증금</p>
                <p className="text-[22px] font-bold text-main">
                    {formatMoney(value.depositMin)} ~ {formatMoney(value.depositMax)}
                </p>
            </div>
            <div id={fieldId("deposit")} className={`mt-3 flex items-center gap-3 ${shake("deposit")}`}>
                <MoneyInput invalid={!!messageOf("deposit")} value={value.depositMin} onChange={(n) => set({ depositMin: Math.min(n, value.depositMax) })} />
                <span className="text-ink-300">–</span>
                <MoneyInput invalid={!!messageOf("deposit")} value={value.depositMax} onChange={(n) => set({ depositMax: Math.max(n, value.depositMin) })} />
            </div>
            <FieldMessage message={messageOf("deposit")} />

            <DepositSlider
                min={value.depositMin}
                max={value.depositMax}
                limit={BUDGET_MAX}
                step={500}
                ticks={TICKS}
                format={formatMoney}
                onChangeMin={(n) => set({ depositMin: Math.min(n, value.depositMax) })}
                onChangeMax={(n) => set({ depositMax: Math.max(n, value.depositMin) })}
            />
            <p className="mt-2 text-[13px] text-ink-400">단위: 만원 · 3억원이 넘으면 칸에 직접 입력해 주세요</p>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <LaterField
                    label="월 임대료 상한"
                    id={fieldId("rent")}
                    shakeClassName={shake("rent")}
                    message={messageOf("rent")}
                    value={value.monthlyRentMax}
                    onChange={(n) => set({ monthlyRentMax: n })}
                    placeholder={300}
                />
                <LaterField
                    label="인테리어 · 설비"
                    id={fieldId("interior")}
                    shakeClassName={shake("interior")}
                    message={messageOf("interior")}
                    value={value.interiorBudgetMax}
                    onChange={(n) => set({ interiorBudgetMax: n })}
                    placeholder={500}
                />
            </div>
        </div>
    );
}

function MoneyInput({ value, onChange, disabled, placeholder, emptyWhenZero, invalid }: {
    value: number | null; onChange: (n: number) => void; disabled?: boolean; placeholder?: number;
    emptyWhenZero?: boolean;
    invalid?: boolean;
}) {
    return (
        <label className={`flex flex-1 items-center gap-2 rounded-lg border px-4 py-3 transition-colors ${invalid ? "border-danger" : "border-line"} ${disabled ? "bg-surface" : "bg-white"}`}>
            <input
                inputMode="numeric"
                disabled={disabled}
                aria-invalid={invalid}
                value={value === null || (emptyWhenZero && value === 0) ? "" : value.toLocaleString()}
                placeholder={placeholder?.toLocaleString()}
                onChange={(e) => onChange(toNumber(e.target.value))}
                className="w-full bg-transparent text-right text-[16px] font-semibold text-ink-900 outline-none placeholder:font-normal placeholder:text-ink-200"
            />
            <span className="shrink-0 text-[14px] text-ink-300">만원</span>
        </label>
    );
}

function LaterField({ label, value, onChange, placeholder, id, shakeClassName, message }: {
    label: string; value: number | null; onChange: (n: number | null) => void; placeholder: number;
    id: string; shakeClassName: string; message?: string | null;
}) {
    const later = value === null;
    return (
        <div id={id}>
            <p className="mb-2 text-[15px] font-semibold text-ink-800">{label}</p>
            <div className={`flex ${shakeClassName}`}>
                <MoneyInput value={value} onChange={onChange} disabled={later} placeholder={placeholder} emptyWhenZero invalid={!!message} />
            </div>
            <FieldMessage message={message} />
            <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-[14px] text-ink-500">
                <input
                    type="checkbox"
                    checked={later}
                    onChange={(e) => onChange(e.target.checked ? null : 0)}
                    className="size-4 accent-main"
                />
                나중에 정하겠습니다
            </label>
        </div>
    );
}
