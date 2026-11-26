import Image from "next/image";
import HeroSearch from "./HeroSearch";
import HeroScoreCard from "./HeroScoreCard";
import HeroStats from "./HeroStats";
import HeroTitle from "./HeroTitle";
import { HeroSpotProvider } from "./HeroSpotContext";
import { Rise } from "../shared/Rise";

// 첫 화면 내용의 양끝을 헤더(좌우 5% 여백, 최대 1440px)에 맞춘다
// 배경은 헤더 뒤까지 채우고, 내용만 헤더 높이(72px)만큼 내려서 둔다
const CONTAINER = "relative top-[72px] mx-auto h-[calc(100%-72px)] w-[90%] max-w-[1440px]";

export default function AboutHero() {
    return (
        <section className="relative w-full h-[973px] overflow-hidden bg-[#070d1a]">
            {/* 배경 이미지 */}
            <Image
                src="/assets/images/about/hero-street.jpg"
                alt=""
                fill
                priority
                className="object-cover"
            />
            {/* 왼쪽 흰색 + 아래쪽 살짝 어두운 그라데이션 */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.93) 0%, rgba(255,255,255,0.78) 42%, rgba(255,255,255,0.08) 70%), linear-gradient(to bottom, rgba(7,13,26,0) 70%, rgba(7,13,26,0.2) 100%)",
                }}
            />

            <div className={CONTAINER}>
            {/* 왼쪽 카피 */}
            <div className="absolute top-[173px] left-0 w-[560px]">
                <Rise delay={50}>
                <p className="flex items-center gap-[10px] h-[20px] font-(family-name:--font-jetbrains-mono) font-medium text-[14px] tracking-[0.12em] text-[#333333]">
                    <span className="w-[8px] h-[8px] rounded-full bg-[#333333]" />
                    BEFORE YOU SIGN · 계약 전 5분
                </p>
                </Rise>

                <HeroTitle />

                <Rise delay={550}>
                <p className="mt-[28px] text-[18px] leading-[1.65] text-[#333333]">
                    주소 하나면 상권 · 폐업 위험 · 임대료 · 지원사업까지<br />
                    계약서에 도장 찍기 전에 확인해 드려요.
                </p>
                </Rise>

                <Rise delay={660} className="mt-[28px]">
                    <HeroSearch />
                </Rise>
            </div>

            <HeroSpotProvider>
             {/* 오른쪽 점수 카드 */}
            <div className="absolute top-[72px] right-0">
                <HeroScoreCard />
            </div>

             {/* 하단 수치 바 */}
             <div className="absolute bottom-[53px] inset-x-0">
                 <HeroStats />
             </div>
            </HeroSpotProvider>
            </div>
        </section>
    );
}