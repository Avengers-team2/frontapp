import Image from "next/image";
import HeroSearch from "./HeroSearch";
import HeroScoreCard from "./HeroScoreCard";
import HeroStats from "./HeroStats";

export default function AboutHero() {
    return (
        <section className="relative w-full h-[901px] mt-[96px] overflow-hidden bg-[#070d1a]">
            {/* 배경 이미지 */}
            <Image
                src="/assets/images/about-hero/hero-street.jpg"
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
                        "linear-gradient(to right, rgba(255,255,255,0.665) 0%, rgba(255,255,255,0.384) 42%, rgba(255,255,255,0.036) 70%), linear-gradient(to bottom, rgba(7,13,26,0) 70%, rgba(7,13,26,0.2) 100%)",
                }}
            />

            {/* 왼쪽 카피 */}
            <div className="absolute top-[173px] left-[max(24px,calc(50%_-_772px))] w-[560px]">
                <p className="flex items-center gap-[10px] h-[16px] font-(family-name:--font-jetbrains-mono) font-medium text-[12px] tracking-[0.12em] text-[#333333]">
                    <span className="w-[8px] h-[8px] rounded-full bg-[#333333]" />
                    BEFORE YOU SIGN · 계약 전 5분
                </p>

                <h1 className="mt-[28px] font-bold text-[72px] leading-[1.12] tracking-[-0.04em] text-black">
                    이 자리<br />
                    <span className="text-[#023684]">계약해도 될까요?</span>
                </h1>

                <p className="mt-[28px] text-[18px] leading-[1.65] text-[#333333]">
                    주소 하나면 상권 · 폐업 위험 · 임대료 · 지원사업까지<br />
                    계약서에 도장 찍기 전에 확인해 드려요.
                </p>

                <div className="mt-[28px]">
                    <HeroSearch />
                </div>
            </div>

            {/* 오른쪽 점수 카드 */}
            <div className="absolute top-[72px] right-[max(24px,calc(50%_-_721px))]">
                <HeroScoreCard />
            </div>

            {/* 하단 수치 바 */}
            <div className="absolute bottom-[53px] left-[max(24px,calc(50%_-_772px))]">
                <HeroStats />
            </div>
        </section>
    );
}