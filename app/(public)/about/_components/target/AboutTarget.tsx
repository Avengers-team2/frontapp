import TargetRoller from "./TargetRoller";

export default function AboutTarget() {
    return (
        <section className="w-full h-[817px] pt-[159px] bg-white">
            <h2 className="text-center font-bold text-[72px] leading-[1.5] text-[#111111]">
                이런 분들이{" "}
                <span className="bg-linear-to-r from-[#023684] to-[#018fed] bg-clip-text text-transparent">
                    StartFit
                </span>
                <span className="ml-[5px] text-black">을 써요</span>
            </h2>

            <p className="mt-[12px] text-center font-medium text-[38px] leading-[1.5] text-[#5b6b80]">
                사업자들의 고민, StartFit이 줄여드립니다.
            </p>

            <div className="mt-[66px]">
                <TargetRoller />
            </div>
        </section>
    );
}