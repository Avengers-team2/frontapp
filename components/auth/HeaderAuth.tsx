"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { logoutApi } from "@/api/auth/auth.api";
import { toLoginHref } from "@/lib/loginRedirect";
import useAuthStore from "@/stores/useAuthStore";
import type { User } from "@/types/user";

type HeaderAuthProps = {
    variant: "dark" | "white";
};

// 메뉴 항목이 아바타 쪽에서 차례로 떠오르는 지연 (70ms + 순서 × 35ms). Tailwind 는 클래스를 문자열 그대로 찾아서 표로 둔다.
const STAGGER = ["delay-[70ms]", "delay-[105ms]", "delay-[140ms]", "delay-[175ms]"];
const SPRING = "ease-[cubic-bezier(0.34,1.45,0.64,1)]";

// 로그인 후 아바타. 클릭하면 마이페이지, 올리면 마이페이지·로그아웃 메뉴가 아바타에서 뻗어 나온다.
function ProfileMenu({ user, variant }: { user: User; variant: "dark" | "white" }) {
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);
    const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLAnchorElement>(null);
    const itemRefs = useRef<(HTMLElement | null)[]>([]);

    // 프로필 사진이 있으면 사진, 없으면 닉네임 첫 글자
    const initial = user.user_nickname?.trim().charAt(0) ?? "";
    const profileImage = user.user_profile_image;
    const avatarClass = variant === "dark"
        ? "bg-[#5EF0DC] text-[#050B17]"
        : "bg-[#1F3A5F] text-white";

    const handleLogout = async () => {
        setOpen(false);
        try {
            await logoutApi(); // 쿠키(토큰) 정리. 실패해도 화면은 로그아웃 상태로 만든다
        } catch {}
        setUser(null);
        setIsAuthenticated(false);
        router.replace("/");
    };

    // 아바타에서 ↓/↑ 로 열고, 메뉴 안에서는 ↑/↓/Home/End 로 움직이고, Esc 로 닫는다
    const focusItem = (index: number) => {
        const items = itemRefs.current.filter(Boolean) as HTMLElement[];
        items[(index + items.length) % items.length]?.focus();
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const items = itemRefs.current.filter(Boolean) as HTMLElement[];
        const current = items.indexOf(document.activeElement as HTMLElement);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            const next = current === -1 ? (e.key === "ArrowDown" ? 0 : -1) : current + (e.key === "ArrowDown" ? 1 : -1);
            // 메뉴가 막 열린 직후엔 아직 보이지 않아 포커스가 안 가므로 한 프레임 뒤에 옮긴다
            requestAnimationFrame(() => focusItem(next));
        } else if (e.key === "Home" && current !== -1) {
            e.preventDefault();
            focusItem(0);
        } else if (e.key === "End" && current !== -1) {
            e.preventDefault();
            focusItem(-1);
        } else if (e.key === "Escape" && open) {
            e.preventDefault();
            setOpen(false);
            avatarRef.current?.focus();
        }
    };

    const itemBase = `transition-[opacity,translate] duration-350 ${SPRING} motion-reduce:transition-none`;
    const itemState = (order: number) =>
        open ? `translate-y-0 opacity-100 ${STAGGER[order]}` : "-translate-y-1.5 opacity-0 delay-0";

    return (
        <div
            ref={wrapperRef}
            className="relative"
            onPointerEnter={() => setOpen(true)}
            onPointerLeave={() => setOpen(false)}
            onBlur={(e) => {
                if (!wrapperRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
            }}
            onKeyDown={handleKeyDown}
        >
            <Link
                ref={avatarRef}
                href="/my-page"
                aria-label="마이페이지"
                aria-haspopup="menu"
                aria-expanded={open}
                className={`flex size-10 items-center justify-center overflow-hidden rounded-full font-bold transition-[box-shadow,scale] duration-300 hover:scale-105 active:scale-95 motion-reduce:transition-none ${avatarClass} ${
                    open ? "ring-2 ring-sub" : ""
                }`}
            >
                {profileImage ? (
                    <img src={profileImage} alt="" className="size-full object-cover" />
                ) : (
                    initial
                )}
            </Link>

            {/* 아바타와 메뉴 사이 틈(pt-3)도 이 영역 안이라, 포인터가 틈을 지나도 메뉴가 닫히지 않는다 */}
            <div
                className={`absolute right-0 top-full w-58 pt-3 transition-[visibility] duration-0 ${
                    open ? "visible delay-0" : "invisible delay-280"
                }`}
            >
                <div
                    role="menu"
                    aria-label="계정 메뉴"
                    className={`relative origin-[calc(100%-20px)_-32px] rounded-2xl bg-white p-1.5 text-[#3D4A5C] ring-1 ring-line shadow-[0_22px_44px_-18px_rgba(0,0,0,0.3),0_4px_12px_-6px_rgba(0,0,0,0.14)] motion-reduce:[transition:none] ${
                        open
                            ? "scale-100 opacity-100 [transition:scale_0.55s_cubic-bezier(0.34,1.45,0.64,1),opacity_0.15s]"
                            : "scale-[0.16] opacity-0 [transition:scale_0.28s_cubic-bezier(0.2,0.8,0.2,1),opacity_0.2s]"
                    }`}
                >
                    <span
                        aria-hidden="true"
                        className="absolute -top-[5px] right-[15px] size-2.5 rotate-45 rounded-[2px] border-l border-t border-line bg-white"
                    />
                    <div className={`relative flex flex-col gap-0.5 px-2.5 pb-2.5 pt-2 ${itemBase} ${itemState(0)}`}>
                        <b className="truncate text-sm font-bold text-ink-900">{user.user_nickname}</b>
                        <span className="truncate text-xs text-ink-500">{user.user_email}</span>
                    </div>
                    <Link
                        ref={(el) => {
                            itemRefs.current[0] = el;
                        }}
                        href="/my-page"
                        role="menuitem"
                        tabIndex={open ? 0 : -1}
                        onClick={() => setOpen(false)}
                        className={`relative flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-[13.5px] font-medium text-ink-900 outline-none hover:bg-surface focus-visible:bg-surface ${itemBase} ${itemState(1)}`}
                    >
                        <UserRound className="size-[18px] shrink-0 text-ink-500" strokeWidth={1.6} aria-hidden="true" />
                        마이페이지
                    </Link>
                    <div
                        role="separator"
                        className={`relative mx-1 my-1.5 h-px bg-line ${itemBase} ${itemState(2)}`}
                    />
                    <button
                        ref={(el) => {
                            itemRefs.current[1] = el;
                        }}
                        type="button"
                        role="menuitem"
                        tabIndex={open ? 0 : -1}
                        onClick={handleLogout}
                        className={`relative flex h-9 w-full items-center gap-2.5 rounded-[10px] px-2.5 text-left text-[13.5px] font-medium text-danger outline-none hover:bg-danger-bg focus-visible:bg-danger-bg ${itemBase} ${itemState(3)}`}
                    >
                        <LogOut className="size-[18px] shrink-0" strokeWidth={1.6} aria-hidden="true" />
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
}

// 헤더 오른쪽 영역: 로그인 상태면 프로필 아바타(올리면 메뉴), 아니면 로그인/회원가입 버튼
export default function HeaderAuth({ variant }: HeaderAuthProps) {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();
    const pathname = usePathname();

    // 서버 렌더링 결과와 맞추기 위해, 마운트 이후에만 로그인 상태를 반영
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (mounted && isAuthenticated && user) {
        return <ProfileMenu user={user} variant={variant} />;
    }

    // 로그인하고 나면 지금 보던 페이지로 돌아오도록 주소를 함께 보낸다.
    // href 는 서버·새 탭에서도 맞게 경로만 쓰고, 그냥 누르면 쿼리까지 포함한 전체 주소로 보낸다.
    const loginHref = toLoginHref(pathname);
    const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        router.push(toLoginHref());
    };

    if (variant === "dark") {
        return (
            <div className="flex gap-[20px] font-bold">
                <Link
                    href={"/join"}
                    className="bg-white border-1 border-[#5EF0DC] rounded-[50px] px-5 py-3"
                >회원가입</Link>
                <Link
                    href={loginHref}
                    onClick={handleLoginClick}
                    className="bg-[#5EF0DC] border-1 border-[#fff] rounded-[50px] px-5 py-3 shadow-[5px_3px_20px_1px_rgba(94,240,220,0.3)]"
                >로그인</Link>
            </div>
        );
    }

    return (
        <div className="flex gap-[20px] font-bold">
            <Link
                href={loginHref}
                onClick={handleLoginClick}
                className="bg-white text-[#3D4A5C] border border-[#E3E8EF] rounded-[50px] px-5 py-3 transition-colors hover:bg-[#1F3A5F] hover:text-white hover:border-[#1F3A5F]"
            >로그인</Link>
            <Link
                href={"/analysis"}
                className="bg-[#1F3A5F] text-white border border-[#1F3A5F] rounded-[50px] px-5 py-3 transition-colors hover:bg-white hover:text-[#1F3A5F]"
            >무료로 시작하기</Link>
        </div>
    );
}
