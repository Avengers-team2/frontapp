"use client"

import { useEffect, useState } from "react";
import { supportCards } from "../../_data/aboutData";

// 카드가 흘러가는 자리: 오른쪽 바깥 → 오른쪽 → 가운데 → 왼쪽 → 왼쪽 바깥
const POS = {
    outLeft: { transform: "translate(-560px, 110px) scale(0.72) rotate(-12deg)", opacity: 0, zIndex: 10 },
    left: { transform: "translate(-330px, 40px) scale(0.86) rotate(-6deg)", opacity: 0.7, zIndex: 20 },
    center: { transform: "translate(0px, 0px) scale(1) rotate(0deg)", opacity: 1, zIndex: 30 },
    right: { transform: "translate(330px, 40px) scale(0.86) rotate(6deg)", opacity: 0.7, zIndex: 20 },
    outRight: { transform: "translate(560px, 110px) scale(0.72) rotate(12deg)", opacity: 0, zIndex: 10 },
};

// 3장을 두 벌로 이어 붙여서, 한 카드가 나가는 동안 같은 카드가 반대편에서 들어올 수 있게 함
const cards = [...supportCards, ...supportCards];

export default function SupportCarousel() {
    const [active, setActive] = useState(0);
    const total = cards.length;

    // 4초마다 한 칸씩 (다른 탭에 가 있으면 멈춤)
    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | null = null;

        const start = () => {
            if (timer) return;
            timer = setInterval(() => setActive((prev) => (prev + 1) % total), 4000);
        };
        const stop = () => {
            if (timer) clearInterval(timer);
            timer = null;
        };
        const onVisibility = () => (document.hidden ? stop() : start());

        start();
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            stop();
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [total]);

    // 가운데 기준으로 몇 칸 떨어져 있는지 (-3 ~ 2)
    const getPos = (i: number) => {
        let d = (i - active + total) % total;
        if (d > total / 2) d -= total;

        if (d === 0) return POS.center;
        if (d === 1) return POS.right;
        if (d === -1) return POS.left;
        if (d === 2) return POS.outRight; // 다음에 들어올 카드
        return POS.outLeft;                // 빠져나간 카드
    };

    return (
        <div className="relative w-[1000px] h-[260px] mx-auto">
            {cards.map((card, i) => {
                const pos = getPos(i);
                const isCenter = pos === POS.center;

                return (
                    <article
                        key={`${card.title}-${i}`}
                        style={pos}
                        className={`absolute left-1/2 top-0 ml-[-155px] w-[310px] h-[174px] p-[25px] rounded-[22px] bg-[rgba(20,34,58,0.92)] border shadow-[0_30px_60px_rgba(0,0,0,0.45)] transition-[transform,opacity,border-color] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
                            isCenter ? "border-[#5ef0dc]/40" : "border-white/16"
                        }`}
                    >
                        {/* 상태 배지 */}
                        <span
                            className="inline-flex items-center h-[30px] px-[13px] rounded-full text-[13px] font-bold"
                            style={{ backgroundColor: card.badgeBg, color: card.badgeColor }}
                        >
                            {card.status}
                        </span>

                        {/* 사업명 */}
                        <h3 className="mt-[16px] text-[20px] font-bold leading-[1.4] text-white">
                            {card.title}
                        </h3>

                        {/* 조건 태그 */}
                        <ul className="flex gap-[8px] mt-[16px]">
                            {card.tags.map((tag) => (
                                <li
                                    key={tag}
                                    className="h-[30px] px-[11px] flex items-center rounded-[8px] border border-[#ff8a6b]/60 text-[13px] font-medium text-[#ffa58c]"
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