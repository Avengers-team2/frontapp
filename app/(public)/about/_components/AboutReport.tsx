import Reveal from "./shared/Reveal";
import BrowserMock from "./shared/BrowserMock";
import ScrollTilt from "./shared/ScrollTilt";
import { reportPoints } from "../_data/aboutData";
import ScrambleText from "./shared/ScrambleText";

export default function AboutReport() {
    return (
        <section className="relative w-full h-[1076px] overflow-hidden bg-[#13284a]">
            {/* 왼쪽 브라우저 */}
            <Reveal className="absolute top-[188px] left-[max(24px,calc(50%_-_604px))]">
            <ScrollTilt>
                <BrowserMock
                    shadow="shadow-none"
                    url="startfit.kr/premium/review"
                    src="/assets/images/about/report-export-capture.png"
                    imgWidth={2880}
                    imgHeight={5850}
                    width={780}
                    viewHeight={660}
                    pillWidth={192}
                    pillTop={8}
                    duration={16000}
                />
            </ScrollTilt>
            </Reveal>

            {/* 오른쪽 글 */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[calc(50%_+_252px)] w-[380px]">
                <Reveal delay={150}>
                    <h2 className="font-bold text-[38px] leading-[1.3] text-white">
                        <ScrambleText text={"내 창업 기획서,\nAI가 꼼꼼하게 분석해요."} tone="dark" delay={150} />
                    </h2>
                </Reveal>

                <Reveal delay={250}>
                    <span className="inline-flex items-center h-[30px] mt-[51px] px-[13px] rounded-full bg-[#9fa8ff]/18 font-bold text-[14px] leading-[21px] text-[#b8c0ff]">
                        Premium
                    </span>
                </Reveal>

                <ul className="flex flex-col gap-[14px] mt-[47px]">
                    {reportPoints.map((point, i) => (
                        <li key={point}>
                            <Reveal delay={350 + i * 100}>
                                <span className="flex items-center gap-[12px] font-medium text-[17px] leading-[26px] text-[#e8eef6] whitespace-nowrap">
                                    <span className="flex items-center justify-center shrink-0 w-[20px] h-[20px] rounded-full bg-[#2bb3a3]">
                                        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.5 5.5L4.5 8.5L10.5 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <ScrambleText text={point} tone="dark" delay={350 + i * 100} />
                                </span>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}