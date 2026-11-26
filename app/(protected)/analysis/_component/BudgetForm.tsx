import { FieldMessage } from "@/components/form/FormMotion";
import { BUDGET_MAX } from "./analysis.data";
import DepositSlider from "./DepositSlider";

type BudgetValue = {
    depositMin: number;
    depositMax: number;
};
type BudgetField = "deposit";
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
            <div className="flex items-end justify-end">
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
        </div>
    );
}

function MoneyInput({ value, onChange, invalid }: { value: number; onChange: (n: number) => void; invalid?: boolean }) {
    return (
        <label className={`flex flex-1 items-center gap-2 rounded-lg border bg-white px-4 py-3 transition-colors ${invalid ? "border-danger" : "border-line"}`}>
            <input
                inputMode="numeric"
                aria-invalid={invalid}
                value={value.toLocaleString()}
                onChange={(e) => onChange(toNumber(e.target.value))}
                className="w-full bg-transparent text-right text-[16px] font-semibold text-ink-900 outline-none"
            />
            <span className="shrink-0 text-[14px] text-ink-300">만원</span>
        </label>
    );
}
