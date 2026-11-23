interface PaginationProps {
    page: number;
    totalPages?: number;
    onPageChange: (page: number) => void;
}

const GROUP_SIZE = 5; // 한 번에 보여줄 페이지 번호 개수

const buttonClass = "flex size-10 items-center justify-center rounded-[11px] text-base";

// 페이지 번호
export default function Pagination({page, totalPages, onPageChange}: PaginationProps) {

    if (!totalPages || totalPages <= 0) return null;

    // 현재 페이지가 속한 묶음의 시작·끝 번호
    const start = Math.floor((page - 1) / GROUP_SIZE) * GROUP_SIZE + 1;
    const end = Math.min(start + GROUP_SIZE - 1, totalPages);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
        <nav className="mt-8 flex items-center justify-center gap-1.75">
            <button
                type="button"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className={`${buttonClass} text-ink-500 disabled:opacity-30`}
            >
                ‹
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    className={`${buttonClass} ${p === page ? "bg-main-dark font-bold text-white" : "text-ink-500"}`}
                >
                    {p}
                </button>
            ))}

            <button
                type="button"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                className={`${buttonClass} text-ink-500 disabled:opacity-30`}
            >
                ›
            </button>
        </nav>
    );
}
