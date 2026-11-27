"use client"

import { isWeak, type ScoreItem } from "../_lib/reportExport";
import { useInView } from "./Reveal";

type Props = {
    items: ScoreItem[];
};

const SIZE = 56;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const STAGGER = 150; // 카드 사이 시간차 (ms)

function MiniGauge({ score, active, delay }: { score: number; active: boolean; delay: number }) {
    const weak = isWeak(score);
    const id = `mini-${score}-${delay}`;

    return (
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0 -rotate-90">
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={weak ? "#ffc25c" : "#5ef0dc"} />
                    <stop offset="100%" stopColor={weak ? "#f29a1f" : "#2bb3a3"} />
                </linearGradient>
            </defs>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#eef1f5" strokeWidth={STROKE} />
            <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill="none"
                stroke={`url(#${id})`}
                strokeWidth={STROKE}
                strokeDasharray={C}
                strokeDashoffset={active ? C * (1 - score / 100) : C}
                className="transition-[stroke-dashoffset] duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transitionDelay: `${delay}ms` }}
            />
        </svg>
    );
}

export default function ScoreCards({ items }: Props) {
    const { ref, inView } = useInView<HTMLUListElement>(0.3);

    return (
        <ul ref={ref} className="grid grid-cols-6 gap-[20px]">
            {items.map((item, i) => (
                <li
                    key={item.name}
                    className={`flex items-center gap-[16px] h-[150px] pl-[18px] rounded-[22px] border border-[#e6ebf1] bg-linear-to-b from-white to-[#f5fbfa] transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[50px]"
                    }`}
                    style={{ transitionDelay: `${i * STAGGER}ms` }}
                >
                    <MiniGauge score={item.score} active={inView} delay={i * STAGGER + 400} />
                    <div>
                        <p className="flex items-baseline gap-[8px]">
                            <span className="font-(family-name:--font-outfit) text-[36px] font-semibold leading-none text-[#111]">
                                {item.score}
                            </span>
                            <span className={`text-[15px] font-bold ${isWeak(item.score) ? "text-[#b9770e]" : "text-[#0b7468]"}`}>
                                {item.grade}
                            </span>
                        </p>
                        <p className="mt-[10px] text-[15px] font-medium text-[#5b6577] whitespace-nowrap" title={item.name}>
                            {item.shortName}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}