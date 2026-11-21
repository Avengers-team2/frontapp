import { heroStats } from "../../_data/aboutData";

export default function HeroStats() {
    return (
        <ul className="flex w-[1251px] h-[84px] rounded-[16px] bg-white/55 border-[1px] border-white/14 backdrop-blur-[12px]">
            {heroStats.map((stat, i) => (
                <li
                    key={stat.label}
                    className={`flex-1 pt-[15px] pl-[24px] ${i > 0 ? "border-l-[1px] border-white/10" : ""}`}
                >
                    <p className="h-[13px] font-(family-name:--font-jetbrains-mono) font-medium text-[10px] leading-[13px] tracking-[0.12em] text-[#333333]">
                        {stat.label}
                    </p>
                    <p className="flex items-end gap-[4px] mt-[4px]">
                        <strong className="font-(family-name:--font-outfit) font-bold text-[26px] leading-[33px] text-black">
                            {stat.value}
                        </strong>
                        <span className="mb-[3px] text-[13px] text-[#333333]">{stat.unit}</span>
                    </p>
                </li>
            ))}
        </ul>
    );
}