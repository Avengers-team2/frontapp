import { heroScoreItems } from "../../_data/aboutData";

export default function HeroScoreCard() {
    return (
        <div className="w-[327px] h-[322px] pt-[28px] px-[39px] rounded-[40px] bg-white/50 border-[1px] border-[#5ef0dc]/50 backdrop-blur-[12px]">
            <p className="h-[13px] font-(family-name:--font-jetbrains-mono) font-medium text-[10px] leading-[13px] tracking-[0.12em] text-[#13284a]">
                SPOT · 강남 신사동 가로수길
            </p>

            <div className="flex items-end gap-[10px] mt-[12px]">
                <strong className="font-(family-name:--font-outfit) font-bold text-[52px] leading-[1] tracking-[-0.03em] text-black">
                    73
                </strong>
                <span className="mb-[4px] text-[14px] text-[#666666]">/100 · 검토 필요</span>
            </div>

            <ul className="flex flex-col gap-[12px] mt-[12px]">
                {heroScoreItems.map((item) => (
                    <li key={item.label}>
                        <div className="flex justify-between h-[20px] text-[13px] leading-[20px]">
                            <span className="text-[#13284a]">{item.label}</span>
                            <span className="font-semibold" style={{ color: item.color }}>
                                {item.status}
                            </span>
                        </div>
                        <div className="w-full h-[3px] mt-[5px] bg-white/80">
                            <div className="h-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}