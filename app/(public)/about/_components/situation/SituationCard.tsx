// Lucian UX/UI Prompt #050 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#050
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
    const cardRef = useCardTilt<HTMLElement>(tagColor); // 테두리 빛은 카드의 태그 색

    return (
        <article
            ref={cardRef}
            className={`relative overflow-hidden w-[394px] h-[502px] p-[28px] rounded-[24px] bg-[#f7f9fc] border-[2px] shadow-[0_20px_44px_rgba(11,27,51,0.10)] transition-[translate,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                active ? "border-[#2bb3a3] -translate-y-[8px]" : "border-[#e2e8f0]"
            }`}
        >
            {/* 태그: 글자색 + 같은 색 12% 배경 */}
            <span
                className="inline-flex items-center h-[30px] px-[13px] rounded-full font-bold text-[14px] leading-[21px]"
                style={{ color: tagColor, backgroundColor: `${tagColor}1f` }}
            >
                {tag}
            </span>

            <h3 className="mt-[18px] font-bold text-[22px] leading-[33px] text-[#0b1b33]">{title}</h3>

            <ul className="flex flex-col gap-[10px] mt-[16px]">
                {points.map((point) => (
                    <li key={point} className="flex items-center gap-[8px] text-[17px] leading-[26px] text-[#4a5a70]">
                        <span className="w-[6px] h-[6px] shrink-0" style={{ backgroundColor: tagColor }} />
                        {point}
                    </li>
                ))}
            </ul>

            <div data-parallax className="absolute inset-0">
                <Image
                    src={image}
                    alt=""
                    width={250}
                    height={250}
                    className={`absolute bottom-[32px] left-1/2 -translate-x-1/2 transition-transform duration-500 ${active ? "scale-105" : "scale-100"}`}
                />
            </div>

            {/* 반사광과 테두리 빛: 커서 자리로 모인다 */}
            <span data-glare aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-soft-light" />
            <span
                data-edge
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] p-[2px] opacity-0 [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]"
            />
        </article>
    );
}