import { ReactNode } from "react";
import MyPageProfile from "./MyPageProfile";
import MyPageSideNav from "./MyPageSideNav";

interface MyPageShellProps {
    children: ReactNode;
}

// 마이페이지 공통 틀 (제목 / 프로필 / 왼쪽 메뉴 + 오른쪽 내용)
export default function MyPageShell({children}: MyPageShellProps) {
    return (
        <main className="mx-auto w-[90%] max-w-[1440px] pb-30 pt-43">
            <section className="border-b border-ink-900 pb-17">
                <p className="text-lg leading-[1.6] text-ink-400">홈 › 마이페이지</p>
                <h1 className="mt-3 text-5xl font-bold leading-[1.3] text-ink-900">마이페이지</h1>
            </section>

            <MyPageProfile />

            <div className="mt-15 h-px bg-line-gray" />

            <div className="mt-13 flex">
                {/* 메뉴는 제자리에 고정 (스크롤해도 따라 내려오지 않음) */}
                <aside className="w-91.5 shrink-0 pl-6.25 pt-12">
                    <MyPageSideNav />
                </aside>
                <div className="min-w-0 flex-1">
                    {children}
                </div>
            </div>
        </main>
    );
}
