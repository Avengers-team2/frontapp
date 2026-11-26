import TargetRoller from "./TargetRoller";
import { Rise, RiseTitle } from "../shared/Rise";

export default function AboutTarget() {
    return (
        <section className="w-full h-[817px] pt-[159px] bg-white">
            <h2 className="text-center font-bold text-[72px] leading-[1.5] text-[#111111]">
                <RiseTitle
                    lines={[[
                        { text: "이런 분들이 " },
                        { text: "StartFit", className: "bg-linear-to-r from-[#023684] to-[#018fed] bg-clip-text text-transparent" },
                        { text: "을 써요", className: "text-black" },
                    ]]}
                />
            </h2>

            <Rise delay={550}>
            <p className="mt-[12px] text-center font-medium text-[38px] leading-[1.5] text-[#5b6b80]">
                사업자들의 고민, StartFit이 줄여드립니다.
            </p>
            </Rise>

            <div className="mt-[66px]">
                <TargetRoller />
            </div>
        </section>
    );
}