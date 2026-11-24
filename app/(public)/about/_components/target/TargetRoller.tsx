"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import { targetItems } from "../../_data/aboutData";

// 자리별 모양 (시안 값 그대로)
const SLOT = [
    "top-0 text-[46px] text-[#0b1b33] opacity-100",                     // 맨 위 (선택됨)
    "top-[95px] text-[38px] text-[#c7c7c7] opacity-100",                // 다음 차례
    "top-[175px] text-[34px] text-[#dddddd] opacity-100 blur-[4px]",    // 그다음 차례 (흐림)
];
// 맨 위에서 빠져나가는 줄
const LEAVE = "top-[-60px] text-[38px] text-[#c7c7c7] opacity-0";

export default function TargetRoller() {
    const [active, setActive] = useState(0);
    const total = targetItems.length;

    // 2.5초마다 아래 줄이 한 칸씩 올라옴
    useEffect(() => {
        const timer = setInterval(() => setActive((prev) => (prev + 1) % total), 2500);
        return () => clearInterval(timer);
    }, [total]);

    return (
        <ul className="relative h-[226px]">
            {targetItems.map((item, i) => {
                const slot = (i - active + total) % total;
                const isLeaving = slot >= SLOT.length;
                const isEntering = slot === SLOT.length - 1; // 맨 아래 새 줄은 이동 없이 서서히 나타남
                const style = isLeaving ? LEAVE : SLOT[slot];
                const transition = isEntering ? "transition-[opacity,filter] duration-700" : "transition-all duration-700";

                return (
                    <li
                        key={item.label}
                        className={`absolute left-0 right-0 flex items-center justify-center font-bold leading-[1.5] ${style} ${transition}`}
                    >
                        <span>{item.label}</span>
                        {/* 아이콘: 맨 위 줄에서만 보임 */}
                        <span
                            className={`relative shrink-0 h-[96px] my-[-14px] overflow-hidden transition-all duration-700 ${
                                slot === 0 ? "w-[96px] ml-[24px] opacity-100" : "w-0 ml-0 opacity-0"
                            }`}
                        >
                            <Image src={item.icon} alt="" fill unoptimized />
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}