"use client"

import { useState } from "react";
import Reveal from "../shared/Reveal";

import { situations } from "../../_data/aboutData";
import SituationCard from "./SituationCard";
import { RiseTitle } from "../shared/Rise";

export default function AboutSituation() {
    // 선택된 카드 (마우스를 올린 카드)
    const [active, setActive] = useState(0);

    return (
        <section className="w-full h-[1050px] pt-[188px] bg-white">
            <div className="w-[1240px] mx-auto">
                <h2 className="font-bold text-[40px] leading-[1.3] text-[#0b1b33]">
                    <RiseTitle lines={[[{ text: "창업 전부터 이전과 폐업 고민까지" }], [{ text: "지금 상황에 맞춰 시작하세요" }]]} />
                </h2>

                <ul className="flex gap-[24px] mt-[50px] ml-[10px]">
                    {situations.map((item, i) => (
                        <li key={item.tag} onMouseEnter={() => setActive(i)}>
                            <Reveal delay={150 + i * 120}>
                                <SituationCard {...item} active={active === i} />
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}