"use client"

import { useEffect, useRef, useState } from "react";

// 요소가 화면에 들어왔는지 감지 (한 번 들어오면 계속 true)
export function useInView<T extends HTMLElement>(threshold = 0.25) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    io.disconnect();
                }
            },
            { threshold }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);

    return { ref, inView };
}

type Props = {
    children: React.ReactNode;
    delay?: number;     // 시작 지연 (ms)
    className?: string;
};

// 화면에 들어오면 아래에서 천천히 떠오름
export default function Reveal({ children, delay = 0, className = "" }: Props) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[60px]"
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}