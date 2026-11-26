import Link from "next/link";
import Reveal from "./shared/Reveal";
import BreathingGlow from "./shared/BreathingGlow";

export default function AboutCTA() {
    return (
        <section className="w-full h-[858px] pt-[187px] bg-[#f7f9fc]">
            <Reveal>
                <div className="relative w-[1192px] h-[483px] mx-auto overflow-hidden rounded-[36px] bg-[#0b1e38] border-[1px] border-[#5ef0dc]/25">
                    {/* 뒤쪽 빛 (숨쉬기): 가운데 민트 빛과, 반 박자 늦은 푸른 빛 */}
                    <BreathingGlow className="top-[60px] left-1/2 -translate-x-1/2 w-[520px] h-[340px] bg-[#2bb3a3]/45 blur-[100px]" />
                    <BreathingGlow className="top-[170px] left-[18%] w-[360px] h-[260px] bg-[#2d5fae]/45 blur-[100px]" delay={750} />

                    <div className="relative flex flex-col items-center pt-[105px]">
                        <Reveal delay={150}>
                            <h2 className="text-center font-bold text-[60px] leading-[1.3]">
                                <span className="text-[#e8eef6]">당신의 사업 파트너</span><br />
                                <span className="font-(family-name:--font-outfit) text-[#5ef0dc]">StartFit</span>
                            </h2>
                        </Reveal>

                        <Reveal delay={300}>
                            <div className="flex items-center gap-[16px] mt-[42px]">
                                {/* 주 버튼 */}
                                <Link
                                    href="/analysis"
                                    className="group flex items-center justify-center gap-[6px] w-[198px] h-[52px] rounded-[10px] bg-[#0e7c70] font-bold text-[16px] leading-[24px] text-white transition-colors duration-300 hover:bg-[#13998a]"
                                >
                                    상권 분석 시작하기
                                    <svg className="transition-transform duration-300 group-hover:translate-x-[3px]" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 0C4.49 0 0 4.49 0 10C0 15.51 4.49 20 10 20C15.51 20 20 15.51 20 10C20 4.49 15.51 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="white" />
                                        <path d="M9.29 6.71001L11.59 9.00001H5V11H11.59L9.29 13.29L10.71 14.71L15.41 10L10.71 5.29001L9.29 6.71001Z" fill="white" />
                                    </svg>
                                </Link>

                                {/* 유리 버튼 */}
                                <Link
                                    href="/support"
                                    className="group flex items-center justify-center gap-[8px] w-[166px] h-[58px] rounded-[10px] bg-white/5 border-[1px] border-white/12 backdrop-blur-[8px] font-bold text-[16px] leading-[24px] text-[#e8eef6] transition-colors duration-300 hover:bg-white/12"
                                >
                                    지원사업 매칭
                                    <span className="transition-transform duration-300 group-hover:translate-x-[3px]">→</span>
                                </Link>
                            </div>
                        </Reveal>

                        <Reveal delay={450}>
                            <p className="mt-[36px] text-[16px] leading-[24px] text-[#8da0b8]">
                                웹 브라우저에서 바로 시작 · 별도 앱 설치 불필요
                            </p>
                        </Reveal>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}