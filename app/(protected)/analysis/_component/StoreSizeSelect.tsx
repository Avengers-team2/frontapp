import { STORE_SIZES } from "./analysis.data";

type StoreSizeSelectProps = { value: string; invalid?: boolean; onChange: (v: string) => void };

export default function StoreSizeSelect({ value, invalid, onChange }: StoreSizeSelectProps) {
    return (
        <div className="flex gap-4">
            {STORE_SIZES.map((size) => {
                const selected = value === size.value;
                return (
                    <button
                        key={size.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onChange(selected ? "" : size.value)}
                        className={`flex h-[140px] w-[160px] flex-col items-center justify-center gap-4 rounded-xl border transition-colors ${
                            selected
                                ? "border-main bg-main text-white"
                                : `${invalid ? "border-danger" : "border-line hover:border-main/40"} bg-white text-ink-700 shadow-sm`
                        }`}
                    >
                        <span className="text-[15px]">
                            <b>{size.label}</b> <span className={selected ? "text-mist-300" : "text-ink-400"}>{size.desc}</span>
                        </span>
                        <span className={`${size.box} border-2 ${selected ? "border-white" : "border-ink-700"}`} />
                    </button>
                );
            })}
        </div>
    );
}
