"use client"

import { useHeroSpot } from "./HeroSpotContext";
import { useCountTo } from "./useCountTo";

interface Stat {
    label: string;
    value: number;
    unit: string;
    decimals?: number;
    signed?: boolean;
}

// 숫자 하나: 처음엔 0부터, 이후엔 이전 값에서 새 값으로
function StatValue({ stat }: { stat: Stat }) {
    const decimals = stat.decimals ?? 0;
    const value = useCountTo(stat.value, { from: 0, decimals, duration: 1000 });
    const text = value.toLocaleString("ko-KR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return <>{stat.signed && value > 0 ? `+${text}` : text}</>;
}

export default function HeroStats() {
    const spot = useHeroSpot();

    return (
        <ul className="flex w-full h-[84px] rounded-[16px] bg-white/55 border-[1px] border-white/14 backdrop-blur-[12px]">
            {spot.stats.map((stat, i) => (
                <li
                    key={stat.label}
                    className={`flex-1 pt-[15px] pl-[24px] ${i > 0 ? "border-l-[1px] border-white/10" : ""}`}
                >
                    <p className="h-[16px] font-(family-name:--font-jetbrains-mono) font-medium text-[12px] leading-[16px] tracking-[0.12em] text-[#333333]">
                        {stat.label}
                    </p>
                    <p className="flex items-end gap-[4px] mt-[4px]">
                        <strong className="font-(family-name:--font-outfit) font-bold text-[26px] leading-[33px] text-black tabular-nums">
                            <StatValue stat={stat} />
                        </strong>
                        <span className="mb-[3px] text-[15px] text-[#333333]">{stat.unit}</span>
                    </p>
                </li>
            ))}
        </ul>
    );
}