type SingleProps = { options: string[]; multiple?: false; value: string; onChange: (v: string) => void };
type MultiProps = { options: string[]; multiple: true; value: string[]; onChange: (v: string[]) => void };

export default function ChipGroup(props: SingleProps | MultiProps) {
    const isSelected = (option: string) =>
        props.multiple ? props.value.includes(option) : props.value === option;

    const handleClick = (option: string) => {
        if (props.multiple) {
            props.onChange(
                props.value.includes(option)
                    ? props.value.filter((v) => v !== option)
                    : [...props.value, option],
            );
        } else {
            props.onChange(props.value === option ? "" : option);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {props.options.map((option) => (
                <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected(option)}
                    onClick={() => handleClick(option)}
                    className={`rounded-xl border px-5 py-2.5 text-[17px] transition-colors ${
                        isSelected(option)
                            ? "border-main bg-main font-semibold text-white"
                            : "border-line bg-white text-ink-600 hover:border-main/40"
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
