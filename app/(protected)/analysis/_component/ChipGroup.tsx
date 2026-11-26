type SingleProps = { options: string[]; multiple?: false; value: string; onChange: (v: string) => void };
type MultiProps = {
    options: string[];
    multiple: true;
    value: string[];
    onChange: (v: string[]) => void;
    allLabel?: string;
    allExclude?: string[];
};

const chipClass = (selected: boolean) =>
    `rounded-xl border px-5 py-2.5 text-[17px] transition-colors ${
        selected
            ? "border-main bg-main font-semibold text-white"
            : "border-line bg-white text-ink-600 hover:border-main/40"
    }`;

export default function ChipGroup(props: SingleProps | MultiProps) {
    const isSelected = (option: string) =>
        props.multiple ? props.value.includes(option) : props.value === option;

    const handleClick = (option: string) => {
        if (props.multiple) {
            const next = props.value.includes(option)
                ? props.value.filter((v) => v !== option)
                : [...props.value, option];
            props.onChange(props.options.filter((o) => next.includes(o)));
        } else {
            props.onChange(props.value === option ? "" : option);
        }
    };

    const selectable = props.multiple
        ? props.options.filter((o) => !(props.allExclude ?? []).includes(o))
        : [];
    const allSelected = props.multiple === true && selectable.length > 0 && selectable.every((o) => props.value.includes(o));

    const handleAll = () => {
        if (!props.multiple) return;
        props.onChange(allSelected ? [] : selectable);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {props.multiple && props.allLabel && (
                <button type="button" aria-pressed={allSelected} onClick={handleAll} className={chipClass(allSelected)}>
                    {props.allLabel}
                </button>
            )}
            {props.options.map((option) => (
                <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected(option)}
                    onClick={() => handleClick(option)}
                    className={chipClass(isSelected(option))}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
