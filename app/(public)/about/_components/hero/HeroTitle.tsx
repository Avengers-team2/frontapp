"use client"

import { useEffect, useState } from "react";

const lines = [
    { text: "이 자리", className: "text-black" },
    { text: "계약해도 될까요?", className: "text-[#023684]" },
];

export default function HeroTitle() {
    const [show, setShow] = useState(false);

    // 화면이 그려진 직후 시작
    useEffect(() => {
        const frame = requestAnimationFrame(() => setShow(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <h1 className="mt-[28px] font-bold text-[72px] leading-[1.12] tracking-[-0.04em]">
            {lines.map((line, i) => (
                // 바깥 span: 넘치는 부분을 가려서 '잘려 나오는' 느낌
                <span key={line.text} className="block overflow-hidden pb-[4px] -mb-[4px]">
                    <span
                        className={`block transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                            show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                        } ${line.className}`}
                        style={{ transitionDelay: `${200 + i * 150}ms` }}
                    >
                        {line.text}
                    </span>
                </span>
            ))}
        </h1>
    );
}