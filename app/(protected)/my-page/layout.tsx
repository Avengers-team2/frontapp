import { ReactNode } from "react";

interface MyPageLayoutProps {
    children: ReactNode;
}

// 마이페이지는 로그인한 사람마다 다른 화면이라 미리 만들기(instant navigation 검사)에서 뺌
// (로그인 확인 전엔 {children} 대신 로딩을 그려서, 검사가 켜져 있으면 경고가 뜸)
export const instant = false;

// 마이페이지 공통 레이아웃: 배경 흰색 (globals.css는 건드리지 않음)
// 로그인 확인(LoginGuard)은 각 page.tsx에서 함 (레이아웃에서 막으면 page가 렌더링에서 빠져 instant navigation 검사 경고가 뜸)
export default function MyPageLayout({children}: MyPageLayoutProps) {
    return (
        <div className="min-h-screen bg-white">
            {children}
        </div>
    );
}
