"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

// 마이페이지 왼쪽 메뉴
const MENUS = [
    { label: "내 분석", href: "/my-page" },
    { label: "관심 지원사업", href: "/my-page/bookmarks" },
    { label: "내가 쓴 글", href: "/my-page/posts" },
    { label: "기획서 검토", href: "/my-page/reports" },
    { label: "회원정보 수정", href: "/my-page/edit" },
    { label: "비밀번호 변경", href: "/my-page/edit#password" },
];

interface MyPageSideNavProps {
    activeHref?: string; // 선택할 메뉴를 직접 정할 때 (회원정보 수정 화면: 스크롤 위치 기준). 없으면 현재 주소 기준
}

// 회원정보 수정 화면 Figma 스타일로 통일 (선택: 28px 민트 / 나머지: 20px 검정)
export default function MyPageSideNav({activeHref}: MyPageSideNavProps) {
    const pathname = usePathname();
    const currentHref = activeHref ?? pathname;

    return (
        <nav className="flex flex-col items-start gap-7">
            {MENUS.map((menu) => {
                const isActive = menu.href === currentHref;
                return (
                    <Link
                        key={menu.label}
                        href={menu.href}
                        className={`font-semibold transition-all ${isActive ? "text-[28px] text-[#40CEAF]" : "text-xl text-black"}`}
                    >
                        {menu.label}
                    </Link>
                );
            })}
        </nav>
    );
}
