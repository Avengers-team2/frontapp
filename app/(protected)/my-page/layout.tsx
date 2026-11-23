import { ReactNode } from "react";

interface MyPageLayoutProps {
    children: ReactNode;
}

// 마이페이지 공통 레이아웃: 배경 흰색 (globals.css는 건드리지 않음)
export default function MyPageLayout({children}: MyPageLayoutProps) {
    return (
        <div className="min-h-screen bg-white">
            {children}
        </div>
    );
}
