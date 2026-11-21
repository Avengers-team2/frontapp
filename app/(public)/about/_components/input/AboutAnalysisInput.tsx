import Reveal from "../shared/Reveal";
import { inputChips, inputPoints } from "../../_data/aboutData";
import BrowserMock from "../shared/BrowserMock";

export default function AboutAnalysisInput() {
    return (
        <section className="relative w-full h-[1050px] overflow-hidden bg-white">
            {/* 왼쪽 브라우저 */}
            <Reveal className="absolute top-[180px] left-[max(24px,calc(50%_-_588px))]">
                <BrowserMock
                    url="startfit.kr/start"
                    src="/assets/images/about/input-capture-v2.png"
                    imgWidth={1417}
                    imgHeight={4000}
                    width={760}
                    viewHeight={635}
                    pillWidth={129}
                />
            </Reveal>

            {/* 오른쪽 글 */}
            <div className="absolute top-[287px] left-[calc(50%_+_248px)] w-[360px]">
                <Reveal delay={150}>
                    <h2 className="font-bold text-[40px] leading-[1.3] text-[#0b1b33]">
                        입력은 간단하게,<br />
                        분석은 꼼꼼하게.
                    </h2>
                </Reveal>

                <ul className="flex flex-col gap-[14px] mt-[40px]">
                    {inputPoints.map((point, i) => (
                        <li key={point}>
                            <Reveal delay={250 + i * 100}>
                                <span className="flex items-center gap-[12px] font-medium text-[16px] leading-[24px] text-[#33445c] whitespace-nowrap">
                                    <span className="flex items-center justify-center shrink-0 w-[20px] h-[20px] rounded-full bg-[#2bb3a3]">
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 4L3.8 6.8L9 1.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {point}
                                </span>
                            </Reveal>
                        </li>
                    ))}
                </ul>

                <Reveal delay={600}>
                    <ul className="flex gap-[8px] mt-[52px]">
                        {inputChips.map((chip) => (
                            <li
                                key={chip.label}
                                className={`flex items-center h-[36px] px-[15px] rounded-full border-[1px] font-semibold text-[13px] leading-[20px] ${
                                    chip.active
                                        ? "bg-[#2bb3a3]/12 border-[#2bb3a3]/60 text-[#1f8f82]"
                                        : "bg-white border-dashed border-[#c9d3e1] text-[#8a9bb3]"
                                }`}
                            >
                                {chip.label}
                            </li>
                        ))}
                    </ul>
                </Reveal>
            </div>
        </section>
    );
}