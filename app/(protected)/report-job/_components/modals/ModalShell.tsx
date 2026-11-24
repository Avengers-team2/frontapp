"use client"

import { useEffect } from "react";
import { FIT } from "../../_lib/fit";

type Props = {
    children: React.ReactNode;
    onClose?: () => void; // 없으면 바깥 클릭·ESC로 닫히지 않음
};

export default function ModalShell({ children, onClose }: Props) {
    useEffect(() => {
        document.body.style.overflow = "hidden"; // 뒤 화면 스크롤 막기
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(20,33,61,0.5)] animate-in fade-in duration-300"
        >
            <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                className={`${FIT} animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300`}
            >
                {children}
            </div>
        </div>
    );
}