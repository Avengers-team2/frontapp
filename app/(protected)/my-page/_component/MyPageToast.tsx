interface MyPageToastProps {
    message: string | null; // null이면 숨김
    compact?: boolean; // 작은 크기 (분석 결과 화면)
}

// 화면 위쪽 가운데 알림 (예: "검토 보고서를 내려받았어요")
export default function MyPageToast({message, compact = false}: MyPageToastProps) {
    if (!message) return null;

    return (
        <div className={`fixed left-1/2 top-24 z-50 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap bg-ink-900 ${compact ? "h-11 rounded-lg px-4" : "h-16.5 px-6"}`}>
            <span className={`${compact ? "text-[14px]" : "text-[22px]"} font-bold leading-normal text-mint`}>✓</span>
            <span className={`${compact ? "text-[14px]" : "text-xl"} font-semibold leading-normal text-white`}>{message}</span>
        </div>
    );
}
