"use client"

import { useEffect, useState } from "react";
import { supportCards } from "../../_data/aboutData";

// 자리별 위치 (가운데 / 오른쪽 / 왼쪽)
const SLOTS = [
    { transform: "translate(0px, 0px) scale(1) rotate(0deg)", opacity: 1, zIndex: 3 },
    { transform: "translate(330px, 40px) scale(0.86) rotate(6deg)", opacity: 0.7, zIndex: 1 },
    { transform: "translate(-330px, 40px) scale(0.86) rotate(-6deg)", opacity: 0.7, zIndex: 1 },
];

export default function SupportCarousel() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const total = supportCards.length;

    // 3초마다 오른쪽 카드가 가운데로
    useEffect(() => {
        if (paused) return;
        const timer = setInterval(() => setActive((prev) => (prev + 1) % total), 3000);
        return () => clearInterval(timer);
    }, [paused, total]);

    return (
        <div
            className="relative w-[1000px] h-[360px] mx-auto"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {supportCards.map((card, i) => {
                const slot = SLOTS[(i - active + total) % total];
                return (
                    <article
                        key={card.title}
                        className="absolute top-[40px] left-1/2 -ml-[155px] w-[310px] h-[174px] p-[25px] rounded-[22px] bg-[rgba(20,34,58,0.92)] border-[1px] border-white/16 shadow-[0_30px_60px_rgba(0,0,0,0.45)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={slot}
                    >
                        <span
                            className="inline-flex items-center h-[30px] px-[12px] rounded-full font-bold text-[13px] leading-[20px]"
                            style={{ backgroundColor: card.statusBg, color: card.statusColor }}
                        >
                            {card.status}
                        </span>

                        <h3 className="mt-[18px] font-bold text-[20px] leading-[30px] text-[#e8eef6]">{card.title}</h3>

                        <ul className="flex gap-[6px] mt-[18px]">
                            {card.tags.map((tag) => (
                                <li
                                    key={tag}
                                    className="flex items-center h-[28px] px-[9px] rounded-[6px] border-[1px] border-[#ff7a5c]/50 text-[12px] leading-[18px] text-[#ffb4a3]"
                                >
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    </article>
                );
            })}
        </div>
    );
}