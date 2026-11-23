"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "./analysis.data";

export default function SectionNav() {
    const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: "-30% 0px -65% 0px" },
        );
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const handleClick = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <nav className="sticky top-[150px] mt-[150px] flex w-[300px] shrink-0 flex-col gap-[22px] self-start">
            {SECTIONS.map(({ id, label }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => handleClick(id)}
                    className={`text-left leading-[30px] transition-all ${
                        activeId === id
                            ? "text-[28px] font-bold text-sub"
                            : "text-[19px] font-semibold text-ink-800 hover:text-ink-900"
                    }`}
                >
                    {label}
                </button>
            ))}
        </nav>
    );
}
