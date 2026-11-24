"use client"

import type { FixItem } from "../_lib/reportExport";
import { useInView } from "./Reveal";

type Props = {
    fixes: FixItem[];
};

export default function FixList({ fixes }: Props) {
    const { ref, inView } = useInView<HTMLOListElement>(0.2);

    return (
        <aside className="flex-1">
            <h3 className="text-[24px] font-bold text-[#111]">보완할 점</h3>

            <ol ref={ref} className="mt-[35px]">
                {fixes.map((fix, i) => (
                    <li
                        key={fix.item}
                        className={`flex gap-[20px] pb-[27px] mb-[24px] border-b border-[#e8edf4] transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                            inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[40px]"
                        }`}
                        style={{ transitionDelay: `${300 + i * 180}ms` }}
                    >
                        <span className="shrink-0 flex items-center justify-center w-[36px] h-[36px] rounded-full bg-[#2bb3a3] text-[16px] font-bold text-white">
                            {i + 1}
                        </span>
                        <div className="pt-[2px]">
                            <p className="text-[20px] font-bold text-[#111]">{fix.item}</p>
                            <p className="mt-[8px] text-[17px] text-[#6b6b6b]">{fix.text}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </aside>
    );
}