"use client"

import useAuthStore from "@/stores/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { SubmitEvent, useEffect, useRef, useState } from "react";
import { BUSINESS_STATUS_OPTIONS } from "../../_component/mockData";
import { updateProfileApi, updateProfileImageApi } from "../_lib/profile.api";
import { helperClass, inputClass, labelClass, secondaryButtonClass, sectionTitleClass } from "./fieldStyle";

const DEFAULT_PROFILE = "/users/default.jpg"; // 백엔드 users.user_profile 기본값과 같음

interface ProfileEditFormProps {
    onSaved: () => void;
}

// 기본 정보 (사진 / 닉네임 / 이메일 / 사업자 상태 / 관심 지역 · 업종)
export default function ProfileEditForm({onSaved}: ProfileEditFormProps) {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    // 입력칸 처음 값 = 로그인 정보 (없으면 빈 칸)
    const [nickname, setNickname] = useState(user?.user_nickname || "");
    const [businessStatus, setBusinessStatus] = useState(user?.user_business_status || "");
    const [region, setRegion] = useState(user?.user_interest_region || "");
    const [industry, setIndustry] = useState(user?.user_interest_industry || "");
    const email = user?.user_email || "";

    // 로그인 정보는 화면이 처음 그려진 뒤에 불러와지므로, 불러와지면 입력칸을 한 번만 채운다
    const filled = useRef(false);
    useEffect(() => {
        if (!user || filled.current) return;
        filled.current = true;
        setNickname(user.user_nickname || "");
        setBusinessStatus(user.user_business_status || "");
        setRegion(user.user_interest_region || "");
        setIndustry(user.user_interest_industry || "");
    }, [user]);

    // 회원정보 수정 저장 (PUT /users/{user_id}) → 성공하면 로그인 정보도 새 값으로 바꿈
    const saveMutation = useMutation({
        mutationFn: () => updateProfileApi(user!.user_id, {
            user_nickname: nickname.trim(),
            user_business_status: businessStatus || undefined,
            user_interest_region: region.trim() || null,
            user_interest_industry: industry.trim() || null,
        }),
        onSuccess: (res) => {
            if (res.data) setUser({ ...user!, ...res.data });
            onSaved();
        },
        onError: (error) => window.alert(error.message),
    });

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            window.alert("로그인 정보가 없어요. 다시 로그인해 주세요.");
            return;
        }
        if (!nickname.trim()) {
            window.alert("닉네임을 입력해 주세요.");
            return;
        }
        saveMutation.mutate();
    }

    // 프로필 사진 (S3 주소일 때만 사진, 아니면 닉네임 첫 글자)
    const profileImage = user?.user_profile?.startsWith("http") ? user.user_profile : null;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 사진 변경 (PUT /users/{user_id}/profile) → 성공하면 로그인 정보의 사진 주소도 바꿈 (바로 저장됨)
    const photoMutation = useMutation({
        mutationFn: (file: File) => updateProfileImageApi(user!.user_id, file),
        onSuccess: (res) => {
            if (res.data) setUser({ ...user!, user_profile: res.data.user_profile });
        },
        onError: (error) => window.alert(error.message),
    });

    // 기본 이미지로 되돌리기 (PUT /users/{user_id}에 user_profile만 보냄) → 성공하면 로그인 정보의 사진 주소도 바꿈 (바로 저장됨)
    const resetPhotoMutation = useMutation({
        mutationFn: () => updateProfileApi(user!.user_id, { user_profile: DEFAULT_PROFILE }),
        onSuccess: (res) => {
            setUser({ ...user!, user_profile: res.data?.user_profile ?? DEFAULT_PROFILE });
        },
        onError: () => window.alert("기본 이미지로 바꾸지 못했어요. 잠시 후 다시 시도해 주세요."),
    });

    const handlePhotoReset = () => {
        if (!user) {
            window.alert("로그인 정보가 없어요. 다시 로그인해 주세요.");
            return;
        }
        resetPhotoMutation.mutate();
    }

    const handlePhotoClick = () => {
        if (!user) {
            window.alert("로그인 정보가 없어요. 다시 로그인해 주세요.");
            return;
        }
        fileInputRef.current?.click();
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // 같은 파일을 다시 골라도 동작하게
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            window.alert("이미지 파일만 올릴 수 있어요.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            window.alert("사진은 5MB 이하만 올릴 수 있어요.");
            return;
        }
        photoMutation.mutate(file);
    }

    return (
        <form id="profile" onSubmit={handleSubmit} className="scroll-mt-34">
            <h2 className={sectionTitleClass}>기본 정보</h2>

            <div className="mt-9 flex items-center gap-7">
                <div className="flex size-19.25 items-center justify-center overflow-hidden rounded-full bg-linear-to-b from-sub-600 to-sub-700 text-[34px] font-bold leading-none text-white">
                    {profileImage ? (
                        <img src={profileImage} alt="" className="size-full object-cover" />
                    ) : (
                        nickname.slice(0, 1) || "?"
                    )}
                </div>
                <button type="button" onClick={handlePhotoClick} disabled={photoMutation.isPending} className={`${secondaryButtonClass} disabled:opacity-60`}>
                    {photoMutation.isPending ? "올리는 중" : "사진 변경"}
                </button>
                {profileImage && (
                    <button type="button" onClick={handlePhotoReset} disabled={resetPhotoMutation.isPending || photoMutation.isPending} className={`${secondaryButtonClass} disabled:opacity-60`}>
                        {resetPhotoMutation.isPending ? "바꾸는 중" : "기본 이미지로"}
                    </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
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
                        const isActive = businessStatus === status.value;
                        return (
                            <button
                                key={status.value}
                                type="button"
                                onClick={() => setBusinessStatus(status.value)}
                                className={`flex h-13 items-center rounded-full px-5 text-xl ${
                                    isActive
                                        ? "bg-main-dark font-bold text-white shadow-[0px_6px_16px_0px_rgba(19,40,74,0.25)]"
                                        : "border border-line bg-white font-normal text-ink-700 shadow-[0px_4px_14px_0px_rgba(11,27,51,0.05)]"
                                }`}
                            >
                                {status.label}
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

            <button type="submit" disabled={saveMutation.isPending} className="mt-11.5 flex h-14 items-center rounded-full bg-main-dark px-7.5 text-xl font-bold text-white disabled:opacity-60">
                {saveMutation.isPending ? "저장 중" : "저장하기"}
            </button>
        </form>
    );
}
