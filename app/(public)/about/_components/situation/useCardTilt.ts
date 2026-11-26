// Lucian UX/UI Prompt #461 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#461
import { useEffect, useRef } from "react";

// 커서를 올리면 카드가 손에 든 것처럼 기울고, 안의 내용은 떠 있는 층처럼 따로 움직인다.
// 카드 안에 data-depth="숫자"(층이 움직이는 거리 px)를 붙여서 쓴다. (글씨가 흐려지지 않게 빛 효과는 넣지 않는다)

type Spring = { value: number; target: number; speed: number };
const spring = (): Spring => ({ value: 0, target: 0, speed: 0 });

export function useCardTilt<T extends HTMLElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const card = ref.current;
        const area = card?.parentElement; // 기울지 않는 칸에서 커서 위치를 잰다
        if (!card || !area || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const animations: Animation[] = [];
        // 값이 매 프레임 바뀌므로, 한 번 만든 애니메이션의 키프레임만 갈아 끼운다
        const holder = (el: Element) => {
            const animation = el.animate([{}], { duration: 1, fill: "both" });
            animation.pause();
            animations.push(animation);
            return (frame: Keyframe) => (animation.effect as KeyframeEffect).setKeyframes([frame, frame]);
        };

        const setCard = holder(card);
        const layers = [...card.querySelectorAll<HTMLElement>("[data-depth]")].map((el) => ({
            depth: Number(el.dataset.depth),
            set: holder(el),
        }));

        const rx = spring();
        const ry = spring();
        const nx = spring();
        const ny = spring();
        const springs = [rx, ry, nx, ny];
        let frame = 0;

        const paint = () => {
            setCard({ transform: `perspective(1000px) rotateX(${rx.value.toFixed(3)}deg) rotateY(${ry.value.toFixed(3)}deg)` });
            for (const layer of layers) {
                layer.set({ transform: `translate(${(nx.value * layer.depth).toFixed(2)}px, ${(ny.value * layer.depth * 0.7).toFixed(2)}px)` });
            }
        };

        const tick = () => {
            frame = 0;
            for (let i = 0; i < 4; i++) {
                for (const s of springs) {
                    s.speed += (110 * (s.target - s.value) - 15 * s.speed) / 240;
                    s.value += s.speed / 240;
                }
            }
            paint();
            if (!springs.every((s) => Math.abs(s.target - s.value) < 0.01 && Math.abs(s.speed) < 0.02)) frame = requestAnimationFrame(tick);
        };
        const kick = () => {
            if (!frame) frame = requestAnimationFrame(tick);
        };

        const onMove = (e: PointerEvent) => {
            const r = area.getBoundingClientRect();
            const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
            const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
            rx.target = -y * 9;
            ry.target = x * 12;
            nx.target = x;
            ny.target = y;
            kick();
        };
        const onLeave = () => {
            for (const s of springs) s.target = 0;
            kick();
        };

        area.addEventListener("pointermove", onMove);
        area.addEventListener("pointerleave", onLeave);
        return () => {
            cancelAnimationFrame(frame);
            area.removeEventListener("pointermove", onMove);
            area.removeEventListener("pointerleave", onLeave);
            animations.forEach((a) => a.cancel());
        };
    }, []);

    return ref;
}
