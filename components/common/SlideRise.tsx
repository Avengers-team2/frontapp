// Lucian UX/UI Prompt #237 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#237

// 슬라이드의 요소가 한 줄씩 보이지 않는 틀 아래에서 밀려 올라오고, 나갈 때는 위로 빠진다.
// RiseLine 으로 감싸고, 슬라이드가 바뀔 때 playRise(slide, "in" | "out") 를 부른다.
// 모션 줄이기를 켜면 움직이지 않고 그대로 보여준다.

const STEP_IN = 95; // 줄 사이 간격 (ms)
const STEP_OUT = 55;

export function RiseLine({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`overflow-hidden pb-[.06em] ${className}`}>
            <div data-rise className="origin-bottom-left translate-y-[108%] rotate-[4deg] motion-reduce:translate-y-0 motion-reduce:rotate-0">
                {children}
            </div>
        </div>
    );
}

export function playRise(slide: Element, direction: "in" | "out") {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    slide.querySelectorAll("[data-rise]").forEach((line, i) => {
        line.getAnimations().forEach((a) => a.cancel());
        if (direction === "in") {
            line.animate(
                [
                    { translate: "0 108%", rotate: "4deg" },
                    { translate: "0 0", rotate: "0deg" },
                ],
                { duration: 900, delay: i * STEP_IN, easing: "cubic-bezier(.2,.9,.2,1)", fill: "both" },
            );
        } else {
            line.animate(
                [
                    { translate: "0 0", rotate: "0deg" },
                    { translate: "0 -108%", rotate: "-2deg" },
                ],
                { duration: 550, delay: i * STEP_OUT, easing: "cubic-bezier(.6,0,.4,1)", fill: "both" },
            );
        }
    });
}
