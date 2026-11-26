"use client"

import { useEffect, useState } from "react";
import MyPageSideNav from "../../_component/MyPageSideNav";
import MyPageToast from "../../_component/MyPageToast";
import useToast from "../../_component/useToast";
import PasswordChangeForm from "./PasswordChangeForm";
import ProfileEditForm from "./ProfileEditForm";
import WithdrawModal from "./WithdrawModal";
import { sectionTitleClass } from "./fieldStyle";

// 회원정보 수정 화면 (기본 정보 / 비밀번호 변경 / 회원 탈퇴)
export default function MemberEditContainer() {
    const { message, showToast } = useToast();
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    // 스크롤 위치에 따라 왼쪽 메뉴 선택 (기본 정보 → 회원정보 수정 / 비밀번호 변경 → 비밀번호 변경)
    const [activeHref, setActiveHref] = useState("/my-page/edit");

    useEffect(() => {
        const sections = [
            { id: "profile", href: "/my-page/edit" },
            { id: "password", href: "/my-page/edit#password" },
        ];

        // 화면 세로 가운데쯤(위 40% ~ 아래 55% 사이)을 지나는 섹션을 현재 섹션으로 봄
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const found = sections.find((s) => s.id === entry.target.id);
                    if (found) setActiveHref(found.href);
                });
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );

        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <main className="mx-auto w-[90%] max-w-[1440px] pb-20 pt-43">
            <MyPageToast message={message} />

            <section className="border-b border-ink-900 pb-17.5">
                <p className="text-lg leading-[1.6] text-ink-400">홈 › 마이페이지 › 회원정보 수정</p>
                <h1 className="mt-3 text-5xl font-bold leading-[1.3] text-ink-900">회원정보 수정</h1>
            </section>

            <div className="mt-13.5 flex">
                {/* 메뉴는 제자리에 고정 (스크롤해도 따라 내려오지 않음) */}
                <aside className="w-91.5 shrink-0 pl-6 pt-49">
                    <MyPageSideNav activeHref={activeHref} />
                </aside>

                <div className="min-w-0 flex-1 pl-2">
                    <ProfileEditForm onSaved={() => showToast("회원정보를 저장했어요")} />

                    <div className="mt-18.5 h-[1.2px] bg-line-gray" />

                    <div className="mt-15.75">
                        <PasswordChangeForm onChanged={() => showToast("비밀번호를 변경했어요")} />
                    </div>

                    <div className="mt-19 h-[1.2px] bg-line-gray" />

                    <section className="mt-16">
                        <h2 className={sectionTitleClass}>회원 탈퇴</h2>
                        <div className="mt-4.5 flex items-start justify-between gap-6">
                            <p className="max-w-194.5 text-[19px] leading-[1.6] text-ink-400">
                                탈퇴하면 저장한 분석 결과와 관심 지원사업이 모두 삭제되고, 다시 되돌릴 수 없어요. 작성한 글은 남아 있어요.
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsWithdrawOpen(true)}
                                className="flex h-13 shrink-0 items-center rounded-full border border-danger bg-white px-7.5 text-xl font-bold text-danger transition-colors hover:bg-danger hover:text-white"
                            >
                                탈퇴하기
                            </button>
                        </div>
                    </section>

                    <p className="mt-23 text-lg leading-[1.6] text-ink-200">분석 결과는 저장한 시점의 데이터 기준이에요.</p>
                </div>
            </div>

            {isWithdrawOpen && <WithdrawModal onClose={() => setIsWithdrawOpen(false)} />}
        </main>
    );
}
