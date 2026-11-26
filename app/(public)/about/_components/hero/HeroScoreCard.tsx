"use client"

import { useHeroSpot } from "./HeroSpotContext";
import { useCountTo } from "./useCountTo";

export default function HeroScoreCard() {
    const spot = useHeroSpot();
    const score = useCountTo(spot.score);

    return (
        <div className="w-[327px] h-[322px] pt-[28px] px-[39px] rounded-[40px] bg-white/50 border-[1px] border-[#5ef0dc]/50 backdrop-blur-[12px]">
            <p
                key={spot.spot}
                className="h-[16px] font-(family-name:--font-jetbrains-mono) font-medium text-[12px] leading-[16px] tracking-[0.12em] text-[#13284a] animate-in fade-in duration-500"
            >
                SPOT · {spot.spot}
            </p>

            <div className="flex items-end gap-[10px] mt-[12px]">
                <strong className="w-[60px] font-(family-name:--font-outfit) font-bold text-[52px] leading-[1] tracking-[-0.03em] text-black tabular-nums">
                    {score}
                </strong>
                <span className="mb-[4px] text-[16px] text-[#666666]">/100 · {spot.verdict}</span>
            </div>

            <ul className="flex flex-col gap-[12px] mt-[12px]">
                {spot.items.map((item) => (
                    <li key={item.label}>
                        <div className="flex justify-between h-[20px] text-[15px] leading-[20px]">
                            <span className="text-[#13284a]">{item.label}</span>
                            <span className="font-semibold transition-colors duration-[800ms]" style={{ color: item.color }}>
                                {item.status}
                            </span>
                        </div>
                        <div className="w-full h-[3px] mt-[5px] bg-white/80">
                            <div
                                className="h-full transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                                style={{ width: `${item.value}%`, backgroundColor: item.color }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}