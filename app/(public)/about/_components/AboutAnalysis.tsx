import Image from "next/image";
import Link from "next/link";
import Reveal from "./shared/Reveal";
import { Rise, RiseTitle } from "./shared/Rise";
import { analysisPoints } from "../_data/aboutData";

export default function AboutAnalysis() {
    return (
        <section className="relative w-full h-[1077px] overflow-hidden bg-linear-to-r from-[#13284a] to-[#0e3a4a]">
            {/* 오른쪽 지도 그래픽: 서서히 나타남 */}
            <Reveal from="fade" delay={300} className="absolute top-[135px] left-1/2 -translate-x-1/2 w-[1440px] h-[807px]">
                <Image
                    src="/assets/images/about/analysis-illust-v2.png"
                    alt="상권 분석 화면 예시"
                    width={1922}
                    height={1077}
                    className="max-w-none w-[1440px] h-[807px]"
                />
            </Reveal>

            {/* 왼쪽 글: 아래에서 차례로 올라옴 */}
            <div className="absolute top-[315px] left-[max(24px,calc(50%_-_650px))] w-[512px]">
                <div>
                    <h2 className="font-bold text-[42px] leading-[1.3] text-white">
                        <RiseTitle lines={[[{ text: "지도 위에서 읽는" }], [{ text: "상권의 가능성" }]]} />
                    </h2>
                </div>

                <Rise delay={350}>
                    <p className="mt-[18px] text-[17px] leading-[26px] text-[#a9c0d8]">
                        선택한 위치를 중심으로 주변 점포부터 경쟁 현황, 고객과 매출까지 한눈에 확인하세요.
                    </p>
                </Rise>

                <ul className="flex flex-col gap-[14px] mt-[27px]">
                    {analysisPoints.map((point, i) => (
                        <li key={point}>
                            <Rise delay={450 + i * 100}>
                                <span className="flex items-center gap-[12px] font-medium text-[17px] leading-[26px] text-[#e8eef6]">
                                    <span className="flex items-center justify-center w-[20px] h-[20px] rounded-full bg-[#2bb3a3]">
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 4L3.8 6.8L9 1.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {point}
                                </span>
                            </Rise>
                        </li>
                    ))}
                </ul>

                <Rise delay={700}>
                    <Link
                        href="/analysis"
                        className="flex items-center justify-center gap-[6px] w-[199px] h-[55px] mt-[56px] rounded-full bg-[#2bb3a3] border-[1px] border-white font-bold text-[15px] text-white"
                    >
                        상권 분석 시작하기
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 0C4.49 0 0 4.49 0 10C0 15.51 4.49 20 10 20C15.51 20 20 15.51 20 10C20 4.49 15.51 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="white" />
                            <path d="M9.29 6.71001L11.59 9.00001H5V11H11.59L9.29 13.29L10.71 14.71L15.41 10L10.71 5.29001L9.29 6.71001Z" fill="white" />
                        </svg>
                    </Link>
                </Rise>
            </div>
        </section>
    );
}