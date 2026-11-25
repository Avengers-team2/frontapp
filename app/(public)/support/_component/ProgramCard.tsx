import type { SupportProgram } from "@/api/support/support.api";

const GRADIENTS: [string, string][] = [
    ["#96BBAC", "#305591"],
    ["#A8D5CF", "#2BB3A3"],
    ["#B9C7E3", "#1F3A5F"],
    ["#C9D8B6", "#5B8C6A"],
    ["#E3D3B8", "#B07A4F"],
    ["#D7C4E2", "#6B5B95"],
    ["#F2C6B6", "#C96B5A"],
    ["#BFE0E8", "#3A7CA5"],
];

const pickGradient = (key: string) => {
    let hash = 0;
    for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    const [from, to] = GRADIENTS[hash % GRADIENTS.length];
    return `linear-gradient(to bottom, ${from}cc, ${to}cc)`;
};

const formatPeriod = (start: string | null, end: string | null) => {
    const f = (d: string | null) => (d ? d.slice(0, 7).replace("-", "/") : "");
    if (!start && !end) return "상시 모집";
    return `${f(start)} - ${f(end)}`;
};

type ProgramCardProps = {
    program: SupportProgram;
    bookmarked: boolean;
    onToggleBookmark: () => void;
};

export default function ProgramCard({ program, bookmarked, onToggleBookmark }: ProgramCardProps) {
    const background = pickGradient(`${program.source}:${program.sourceId}`);
    const url = program.detailUrl;

    const openDetail = () => {
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <article
            role={url ? "link" : undefined}
            tabIndex={url ? 0 : undefined}
            aria-label={url ? `${program.title} 공고 보기 (새 창)` : undefined}
            onClick={openDetail}
            onKeyDown={(e) => {
                if (e.key === "Enter") openDetail();
            }}
            className={`flex h-134.5 w-full flex-col overflow-hidden rounded-[40px] border border-line bg-white shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)] transition ${
                url ? "cursor-pointer hover:-translate-y-1 hover:shadow-[0px_12px_28px_0px_rgba(11,27,51,0.12)] focus-visible:outline-2 focus-visible:outline-sub" : ""
            }`}
        >
            <div
                className="flex h-56 shrink-0 flex-col items-center justify-center gap-2 px-10 text-center"
                style={{ backgroundImage: background }}
            >
                <p className="line-clamp-2 text-[21px] font-bold leading-[1.4] text-[#111111]">{program.title}</p>
                <p className="line-clamp-1 text-[15px] font-bold text-white">{program.organization ?? "기관 정보 없음"}</p>
            </div>

            <div className="flex flex-1 flex-col px-9 pb-9 pt-7">
                <div className="flex items-center gap-3">
                    <span className="inline-flex h-8.75 items-center rounded-full bg-surface px-3.5 text-[17px] font-medium text-ink-500">
                        {program.category ?? "기타"}
                    </span>
                    <span className="text-[17px] text-ink-400">{formatPeriod(program.startDate, program.endDate)}</span>
                </div>

                <h3 className="mt-5 line-clamp-1 text-[26px] font-bold leading-[1.4] text-ink-900">{program.title}</h3>
                <p className="mt-2 text-[19px] font-semibold text-sub-700">{program.organization ?? "기관 정보 없음"}</p>
                <p className="mt-3 line-clamp-1 text-[17px] text-ink-400">{program.summary}</p>

                <div className="mt-auto flex items-end justify-between gap-3">
                    <ul className="flex flex-wrap gap-2">
                        {program.tags.slice(0, 3).map((tag) => (
                            <li key={tag} className="inline-flex h-8 items-center rounded-full bg-surface px-3 text-[15px] text-ink-500">
                                {tag}
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        aria-pressed={bookmarked}
                        aria-label={bookmarked ? "관심 해제" : "관심 등록"}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark();
                        }}
                        onKeyDown={(e) => e.stopPropagation()}
                        className={`flex h-13 w-15 shrink-0 items-center justify-center rounded-xl text-[22px] font-bold ${
                            bookmarked
                                ? "bg-main-dark text-white shadow-[0px_6px_16px_0px_rgba(19,40,74,0.25)]"
                                : "border border-line bg-white text-ink-300 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
                        }`}
                    >
                        {bookmarked ? "★" : "☆"}
                    </button>
                </div>
            </div>
        </article>
    );
}
