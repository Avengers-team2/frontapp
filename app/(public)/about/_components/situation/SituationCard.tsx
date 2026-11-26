// Lucian UX/UI Prompt #461 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#461
"use client"

import Image from "next/image";
import { useCardTilt } from "./useCardTilt";

interface SituationCardProps {
    tag: string;
    tagColor: string;
    title: string;
    points: string[];
    image: string;
    active: boolean;
}

export default function SituationCard({ tag, tagColor, title, points, image, active }: SituationCardProps) {
    const cardRef = useCardTilt<HTMLElement>();

    return (
        <article
            ref={cardRef}
            className={`relative overflow-hidden w-[394px] h-[502px] p-[28px] rounded-[24px] bg-[#f7f9fc] border-[2px] shadow-[0_20px_44px_rgba(11,27,51,0.10)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                active ? "border-[#2bb3a3] -translate-y-[8px]" : "border-[#e2e8f0]"
            }`}
        >
            <div data-depth="2">
                {/* 태그: 글자색 + 같은 색 12% 배경 */}
                <span
                    className="inline-flex items-center h-[30px] px-[13px] rounded-full font-bold text-[14px] leading-[21px]"
                    style={{ color: tagColor, backgroundColor: `${tagColor}1f` }}
                >
                    {tag}
                </span>
            </div>

            <h3 data-depth="5" className="mt-[18px] font-bold text-[22px] leading-[33px] text-[#0b1b33]">{title}</h3>

            <ul data-depth="3" className="flex flex-col gap-[10px] mt-[16px]">
                {points.map((point) => (
                    <li key={point} className="flex items-center gap-[8px] text-[17px] leading-[26px] text-[#4a5a70]">
                        <span className="w-[6px] h-[6px] shrink-0" style={{ backgroundColor: tagColor }} />
                        {point}
                    </li>
                ))}
            </ul>

            <div data-depth="10" className="absolute inset-0">
                <Image
                    src={image}
                    alt=""
                    width={250}
                    height={250}
                    className={`absolute bottom-[32px] left-1/2 -translate-x-1/2 transition-transform duration-500 ${active ? "scale-105" : "scale-100"}`}
                />
            </div>
        </article>
    );
}