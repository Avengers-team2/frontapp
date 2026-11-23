"use client"

import useAuthStore from "@/stores/useAuthStore";
import { SubmitEvent, useState } from "react";
import { BUSINESS_STATUS_OPTIONS, MOCK_PROFILE } from "../../_component/mockData";
import { helperClass, inputClass, labelClass, secondaryButtonClass, sectionTitleClass } from "./fieldStyle";

interface ProfileEditFormProps {
    onSaved: () => void;
}

// 기본 정보 (사진 / 닉네임 / 이메일 / 사업자 상태 / 관심 지역 · 업종)
export default function ProfileEditForm({onSaved}: ProfileEditFormProps) {
    const user = useAuthStore((state) => state.user);

    const [nickname, setNickname] = useState(user?.user_nickname || MOCK_PROFILE.nickname);
    const [businessStatus, setBusinessStatus] = useState(MOCK_PROFILE.businessStatus);
    const [region, setRegion] = useState(`서울 ${MOCK_PROFILE.region}`);
    const [industry, setIndustry] = useState(MOCK_PROFILE.industry);
    const email = user?.user_email || "gildong@startfit.kr";

    // TODO: 회원정보 수정 API 연결
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSaved();
    }

    // TODO: 프로필 사진 업로드 (user.api.ts의 updateProfileApi) 연결
    const handlePhotoClick = () => {
        window.alert("사진 변경은 준비 중이에요.");
    }

    return (
        <form id="profile" onSubmit={handleSubmit} className="scroll-mt-34">
            <h2 className={sectionTitleClass}>기본 정보</h2>

            <div className="mt-9 flex items-center gap-7">
                <div className="flex size-19.25 items-center justify-center rounded-full bg-linear-to-b from-sub-600 to-sub-700 text-[34px] font-bold leading-none text-white">
                    {nickname.slice(0, 1) || "?"}
                </div>
                <button type="button" onClick={handlePhotoClick} className={secondaryButtonClass}>사진 변경</button>
            </div>

            <label className="mt-13.5 block">
                <p className={labelClass}>닉네임</p>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className={`mt-4 ${inputClass}`} />
            </label>

            <div className="mt-8">
                <p className={labelClass}>이메일</p>
                <div className="mt-3 flex h-14.5 items-center justify-between rounded-xl border-[1.2px] border-line-strong bg-[#F5F5F5] px-4.75">
                    <span className="text-[22px] leading-normal text-ink-400">{email}</span>
                    <span className="text-lg font-semibold text-ink-400">변경 불가</span>
                </div>
                <p className={helperClass}>가입한 이메일은 바꿀 수 없어요.</p>
            </div>

            <div className="mt-7.5">
                <p className={labelClass}>사업자 상태</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                    {BUSINESS_STATUS_OPTIONS.map((status) => {
                        const isActive = businessStatus === status;
                        return (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setBusinessStatus(status)}
                                className={`flex h-13 items-center rounded-full px-5 text-xl ${
                                    isActive
                                        ? "bg-main-dark font-bold text-white shadow-[0px_6px_16px_0px_rgba(19,40,74,0.25)]"
                                        : "border border-line bg-white font-normal text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
                                }`}
                            >
                                {status}
                            </button>
                        );
                    })}
                </div>
                <p className="mt-6 text-lg leading-normal text-ink-400">상태에 따라 맞춤 지원사업이 달라져요.</p>
            </div>

            <div className="mt-7.5 grid grid-cols-2 gap-6">
                <label className="block">
                    <p className={labelClass}>관심 지역</p>
                    <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} className={`mt-4 ${inputClass}`} />
                </label>
                <label className="block">
                    <p className={labelClass}>관심 업종</p>
                    <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className={`mt-4 ${inputClass}`} />
                </label>
            </div>

            <button type="submit" className="mt-11.5 flex h-14 items-center rounded-full bg-main-dark px-7.5 text-xl font-bold text-white">
                저장하기
            </button>
        </form>
    );
}
