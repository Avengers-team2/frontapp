import Reveal from "./shared/Reveal";
import BrowserMock from "./shared/BrowserMock";
import { reportPoints } from "../_data/aboutData";

export default function AboutReport() {
    return (
        <section className="relative w-full h-[1076px] overflow-hidden bg-[#13284a]">
            {/* 왼쪽 브라우저 */}
            <Reveal className="absolute top-[188px] left-[max(24px,calc(50%_-_604px))]">
            <BrowserMock
                url="startfit.kr/premium/review"
                src="/assets/images/about/report-export-capture.png"
                imgWidth={2880}
                imgHeight={5850}
                width={780}
                viewHeight={660}
                pillWidth={192}
                pillTop={8}
                shadow="shadow-[0_36px_70px_rgba(11,27,51,0.5),0_4px_12px_rgba(11,27,51,0.06)]"
                duration={16000}
            />
            </Reveal>

            {/* 오른쪽 글 */}
            <div className="absolute top-[314px] left-[calc(50%_+_284px)] w-[380px]">
                <Reveal delay={150}>
                    <h2 className="font-bold text-[38px] leading-[1.3] text-white">
                        내 창업 기획서,<br />
                        AI가 꼼꼼하게 분석해요.
                    </h2>
                </Reveal>

                <Reveal delay={250}>
                    <span className="inline-flex items-center h-[28px] mt-[51px] px-[12px] rounded-full bg-[#9fa8ff]/18 font-bold text-[12px] leading-[18px] text-[#b8c0ff]">
                        Premium
                    </span>
                </Reveal>

                <ul className="flex flex-col gap-[14px] mt-[47px]">
                    {reportPoints.map((point, i) => (
                        <li key={point}>
                            <Reveal delay={350 + i * 100}>
                                <span className="flex items-center gap-[12px] font-medium text-[16px] leading-[24px] text-[#e8eef6] whitespace-nowrap">
                                    <span className="flex items-center justify-center shrink-0 w-[20px] h-[20px] rounded-full bg-[#2bb3a3]">
                                        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.5 5.5L4.5 8.5L10.5 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {point}
                                </span>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}