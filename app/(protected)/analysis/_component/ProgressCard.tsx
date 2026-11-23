type ProgressCardProps = {
    done: number;
    total: number;
};

export default function ProgressCard({ done, total }: ProgressCardProps) {
    const percent = Math.round((done / total) * 100);

    return (
        <div className="w-[406px] rounded-2xl border border-white/10 bg-navy-900/60 px-[30px] py-8 shadow-2xl backdrop-blur-md">
            <p className="text-[14px] font-bold tracking-wider text-mint">LIVE · 입력 현황</p>
            <div className="mt-3 flex items-baseline gap-3">
                <span className="font-outfit text-[60px] font-bold leading-none text-white">{percent}%</span>
                <span className="text-[16px] text-mist-300">
                    필수 항목 {done} / {total} 입력
                </span>
            </div>
            <div
                className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="h-full rounded-full bg-linear-to-r from-sub to-mint transition-[width] duration-500 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
            <p className="mt-4 text-[14px] text-mist-500">항목을 채울수록 실시간으로 올라가요</p>
        </div>
    );
}
