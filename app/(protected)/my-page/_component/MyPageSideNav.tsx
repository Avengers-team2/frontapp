"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

// 마이페이지 왼쪽 메뉴
const MENUS = [
    { label: "내 정보", href: "/my-page" },
    { label: "내 분석", href: "/my-page/analyses" },
    { label: "관심 지원사업", href: "/my-page/bookmarks" },
    { label: "내가 쓴 글", href: "/my-page/posts" },
    { label: "기획서 검토", href: "/my-page/reports" },
    { label: "회원정보 수정", href: "/my-page/edit" },
    { label: "비밀번호 변경", href: "/my-page/edit#password" },
];

interface MyPageSideNavProps {
    activeHref?: string; // 선택할 메뉴를 직접 정할 때 (회원정보 수정 화면: 스크롤 위치 기준). 없으면 현재 주소 기준
}

// 선택: 왼쪽 세로 막대 + 굵은 검정 / 나머지: 회색
export default function MyPageSideNav({activeHref}: MyPageSideNavProps) {
    const pathname = usePathname();
    const currentHref = activeHref ?? pathname;

    return (
        <nav className="flex flex-col items-start gap-5">
            {MENUS.map((menu) => {
                const isActive = menu.href === currentHref;
                return (
                    <Link
                        key={menu.label}
                        href={menu.href}
                        className={`border-l-[3px] pl-3 text-lg transition-colors ${isActive ? "border-ink-900 font-bold text-ink-900" : "border-transparent text-ink-400 hover:text-ink-900"}`}
                    >
                        {menu.label}
                    </Link>
                );
            })}
        </nav>
    );
}
