"use client"

import { ReactNode, useEffect, useRef, useState } from "react";

interface RevealProps {
    children: ReactNode;
    delay?: number;           // 나타나기 전 대기 시간 (ms)
    from?: "up" | "fade";     // up: 아래에서 올라옴 / fade: 제자리에서 서서히
    className?: string;
}

export default function Reveal({ children, delay = 0, from = "up", className = "" }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [show, setShow] = useState(false);

    // 화면에 20% 이상 보이면 한 번만 실행
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShow(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const hidden = from === "up" ? "opacity-0 translate-y-[40px]" : "opacity-0 scale-[0.97]";

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                show ? "opacity-100 translate-y-0 scale-100" : hidden
            } ${className}`}
        >
            {children}
        </div>
    );
}