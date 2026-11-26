import Reveal from "../shared/Reveal";
import SupportCarousel from "./SupportCarousel";
import { Rise, RiseTitle } from "../shared/Rise";

export default function AboutSupport() {
    return (
        <section className="relative w-full h-[990px] pt-[190px] overflow-hidden bg-[#f7f9fc]">
            {/* 뒤쪽 민트 빛 */}
            <div className="absolute top-[237px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[#d3fff9]/50 blur-[120px]" />

            <div className="relative text-center">
                <h2 className="font-bold text-[40px] leading-[1.5]">
                    <RiseTitle
                        lines={[[{ text: "내 조건에 맞는 지원사업", className: "text-[#0b7468]" }], [{ text: "놓치지 않도록", className: "text-[#0b1b33]" }]]}
                    />
                </h2>

                <Rise delay={600}>
                    <p className="mt-[28px] text-[17px] leading-[26px] text-[#333333]">
                        내 조건으로 신청할 수 있는 공고를 마감일 순으로 모아보고,<br />
                        지원금, 조건, 자부담금과 같은 조건도 미리 확인하세요.
                    </p>
                </Rise>
            </div>

            <Reveal delay={250} className="relative mt-[50px]">
                <SupportCarousel />
            </Reveal>
        </section>
    );
}