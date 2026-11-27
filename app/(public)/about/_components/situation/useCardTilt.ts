// Lucian UX/UI Prompt #050 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#050
import { useEffect, useRef } from "react";

// 커서를 따라 카드가 기울고(좌우 최대 7도, 위아래 5도), 표면의 반사광과 테두리 빛이 커서 자리로 모인다.
// 카드 안에 data-glare(반사광), data-edge(테두리 빛), data-parallax(반대로 살짝 움직이는 그림)를 붙여서 쓴다.

const EASE = "cubic-bezier(.2,.8,.2,1)";

export function useCardTilt<T extends HTMLElement>(color: string) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const card = ref.current;
        const area = card?.parentElement; // 기울지 않는 칸에서 커서 위치를 잰다
        if (!card || !area) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const glare = card.querySelector<HTMLElement>("[data-glare]");
        const edge = card.querySelector<HTMLElement>("[data-edge]");
        const picture = card.querySelector<HTMLElement>("[data-parallax]");

        // 같은 요소의 이전 애니메이션을 지우고 새 상태로 옮긴다 (시작점은 지금 보이는 값)
        const running = new Map<string, Animation>();
        const move = (key: string, el: Element | null, frame: Keyframe, duration: number, easing = "linear") => {
            if (!el) return;
            const next = el.animate([frame], { duration, easing, fill: "forwards" });
            next.finished.then(
                () => {
                    running.get(key)?.cancel();
                    running.set(key, next);
                },
                () => {},
            );
        };

        const onMove = (e: PointerEvent) => {
            if (e.pointerType === "touch") return;
            const r = area.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            const at = `${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`;

            move("glare", glare, { opacity: 1, backgroundImage: `radial-gradient(260px circle at ${at}, rgba(255,255,255,.28), transparent 60%)` }, 0);
            move("edge", edge, { opacity: 1, backgroundImage: `radial-gradient(200px circle at ${at}, ${color}, transparent 70%)` }, 0);
            if (reduce) return;
            move("card", card, { transform: `perspective(1000px) rotateX(${((0.5 - y) * 10).toFixed(2)}deg) rotateY(${((x - 0.5) * 14).toFixed(2)}deg)` }, 120);
            move("picture", picture, { transform: `translate(${((0.5 - x) * 16).toFixed(1)}px, ${((0.5 - y) * 12).toFixed(1)}px)` }, 120);
        };

        const onLeave = () => {
            move("glare", glare, { opacity: 0 }, 400);
            move("edge", edge, { opacity: 0 }, 400);
            move("card", card, { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" }, 600, EASE);
            move("picture", picture, { transform: "translate(0px, 0px)" }, 600, EASE);
        };

        area.addEventListener("pointermove", onMove);
        area.addEventListener("pointerleave", onLeave);
        return () => {
            area.removeEventListener("pointermove", onMove);
            area.removeEventListener("pointerleave", onLeave);
            [card, glare, edge, picture].forEach((el) => el?.getAnimations().forEach((a) => a.cancel()));
        };
    }, [color]);

    return ref;
}
