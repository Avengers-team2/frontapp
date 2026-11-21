type HighlightTextProps = { text: string; keyword: string };

export default function HighlightText({ text, keyword }: HighlightTextProps) {
    const k = keyword.trim();
    const index = k ? text.toLowerCase().indexOf(k.toLowerCase()) : -1;
    if (index < 0) return <>{text}</>;

    return (
        <>
            {text.slice(0, index)}
            <b className="font-bold text-ink-900">{text.slice(index, index + k.length)}</b>
            {text.slice(index + k.length)}
        </>
    );
}
