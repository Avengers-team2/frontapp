"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { heroSpots } from "../../_data/aboutData";

type Spot = (typeof heroSpots)[number];

const HeroSpotContext = createContext<Spot>(heroSpots[0]);

// 3초마다 다음 지역 → 점수 카드와 하단 바가 같이 바뀜
export function HeroSpotProvider({ children }: { children: ReactNode }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIndex((prev) => (prev + 1) % heroSpots.length), 3000);
        return () => clearInterval(timer);
    }, []);

    return <HeroSpotContext.Provider value={heroSpots[index]}>{children}</HeroSpotContext.Provider>;
}

export const useHeroSpot = () => useContext(HeroSpotContext);