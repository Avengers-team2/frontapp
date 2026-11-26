import { RiseTitle } from "../shared/Rise";

export default function HeroTitle() {
    return (
        <h1 className="mt-[28px] font-bold text-[72px] leading-[1.12] tracking-[-0.04em]">
            <RiseTitle lines={[[{ text: "이 자리", className: "text-black" }], [{ text: "계약해도 될까요?", className: "text-[#023684]" }]]} />
        </h1>
    );
}
