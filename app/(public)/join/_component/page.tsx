"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { checkEmailApi, signUpApi } from "@/api/auth/auth.api";
import { SignUpRequestDTO } from "@/types/auth/auth.type";
import { ApiResponseDTO } from "@/types/common/common.type";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 소셜 가입 버튼 (백엔드 OAuth 시작 경로 /auth/{path}, 아이콘은 public/assets/icons)
const SOCIAL_BUTTONS = [
    { path: "kakao", label: "카카오로 가입", icon: "/assets/icons/login_Kakao_icon.png" },
    { path: "naver", label: "네이버로 가입", icon: "/assets/icons/login_Naver_icon.png" },
    { path: "google", label: "구글로 가입", icon: "/assets/icons/login_Google_icon.png" },
];
// 영문 + 숫자 + 특수문자(!@#$%^&*) 각 하나 이상, 8자 이상
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

// 사업자 상태 선택지
const BUSINESS_STATUSES = [
    { value: "PREPARING", label: "예비 창업자" },
    { value: "OPERATING", label: "운영 중" },
    { value: "CLOSING", label: "폐업 예정" },
    { value: "RELOCATING", label: "가게 이전" },
    { value: "UNDECIDED", label: "미정" },
];

// 폼타입 (약관 체크 포함)
interface JoinFormValues {
    user_email: string;
    user_password: string;
    passwordConfirm: string;
    user_nickname: string;
    user_business_status: string;
    agree_terms: boolean;
    agree_privacy: boolean;
    agree_marketing: boolean;
}

// 회원가입 페이지
export default function JoinSignUp() {
    const router = useRouter();

    // 이메일 중복 확인 결과 (이메일이 바뀌면 다시 확인해야 함)
    const [emailChecked, setEmailChecked] = useState(false);
    const [emailCheckMessage, setEmailCheckMessage] = useState("");
    // 비밀번호 표시/숨김
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        formState: { errors, isValid, isSubmitting },
    } = useForm<JoinFormValues>({
        mode: "onChange",
        defaultValues: { user_business_status: "PREPARING" },
    });

    const agreeTerms = watch("agree_terms");
    const agreePrivacy = watch("agree_privacy");
    const agreeMarketing = watch("agree_marketing");
    const businessStatus = watch("user_business_status");
    const isAllAgreed = agreeTerms && agreePrivacy && agreeMarketing;
    // 이메일 입력 오류 또는 중복 확인 실패 시 빨간 테두리
    const emailHasError = !!errors.user_email || (!!emailCheckMessage && !emailChecked);

    // 이메일 중복 확인 mutation
    const checkEmailMutation = useMutation({
        mutationFn: checkEmailApi,
        onSuccess: (datas: ApiResponseDTO) => {
            if (datas.data === true) {
                setEmailChecked(true);
                setEmailCheckMessage("사용할 수 있는 이메일이에요.");
            } else {
                setEmailChecked(false);
                setEmailCheckMessage("이미 가입된 이메일이에요. 로그인해 주세요.");
            }
        },
        onError: (err: Error) => {
            setEmailChecked(false);
            setEmailCheckMessage(err.message);
        },
    });

    // 회원가입 mutation
    const signUpMutation = useMutation({
        mutationFn: signUpApi,
        onSuccess: (datas: ApiResponseDTO) => {
            alert(datas.message || "회원가입이 완료되었습니다. 로그인해 주세요.");
            router.push("/login");
        },
        onError: (err: Error) => {
            alert(err.message);
        },
    });

    const handleCheckEmail = () => {
        const email = getValues("user_email");
        if (!email || !emailRegex.test(email)) {
            setEmailChecked(false);
            setEmailCheckMessage("이메일 양식에 맞게 입력해 주세요.");
            return;
        }
        checkEmailMutation.mutate(email);
    };

    // 전체 동의 체크박스
    const handleAllAgree = (checked: boolean) => {
        setValue("agree_terms", checked, { shouldValidate: true });
        setValue("agree_privacy", checked, { shouldValidate: true });
        setValue("agree_marketing", checked, { shouldValidate: true });
    };

    const onSubmit = (values: JoinFormValues) => {
        if (!emailChecked) {
            alert("이메일 중복 확인을 해주세요.");
            return;
        }
        const payload: SignUpRequestDTO = {
            user_email: values.user_email,
            user_password: values.user_password,
            user_nickname: values.user_nickname,
            user_business_status: values.user_business_status,
            agree_terms: values.agree_terms,
            agree_privacy: values.agree_privacy,
            agree_marketing: values.agree_marketing,
        };
        signUpMutation.mutate(payload);
    };

    const isDisabled =
        !isValid || !agreeTerms || !agreePrivacy || !emailChecked || isSubmitting || signUpMutation.isPending;

    // 에러 여부에 따라 테두리 색 변경 (빨강 / 기본 + 포커스 시 진한 남색)
    const inputClass = (hasError: boolean) =>
        `mt-2 h-[52px] w-full rounded-[10px] border px-4 text-[16px] outline-none ${
            hasError ? "border-[#E5484D]" : "border-[#D5DCE6] focus:border-[#0B1B33]"
        }`;
    const errorClass = "mt-1 text-[12px] text-[#E5484D]";

    return (
        <div className="flex flex-col items-center px-4 pt-[150px] pb-[120px] min-h-screen bg-white">
            <div className="flex flex-col justify-center items-center w-full max-w-[700px]">
                <h1 className="text-[40px] font-bold text-[#0B1B33]">회원가입</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-[64px] flex w-full flex-col">
                    {/* 계정 정보 */}
                    <section>
                        <h2 className="flex items-baseline gap-2 text-[22px] font-bold text-[#0B1B33]">
                            계정 정보
                        </h2>

                        {/* 이메일 + 중복 확인 */}
                        <label className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">이메일</span>
                            {/* 입력창 테두리 안 오른쪽에 중복 확인 버튼 */}
                            <div
                                className={`mt-2 flex h-[52px] items-center rounded-[10px] border pl-4 pr-[6px] ${
                                    emailHasError ? "border-[#E5484D]" : "border-[#D5DCE6] focus-within:border-[#0B1B33]"
                                }`}
                            >
                                <input
                                    type="text"
                                    placeholder="example@startfit.kr"
                                    className="min-w-0 flex-1 text-[16px] outline-none"
                                    {...register("user_email", {
                                        required: "이메일을 입력해 주세요.",
                                        pattern: { value: emailRegex, message: "이메일 양식에 맞게 입력해 주세요." },
                                        onChange: () => {
                                            setEmailChecked(false);
                                            setEmailCheckMessage("");
                                        },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={handleCheckEmail}
                                    disabled={checkEmailMutation.isPending}
                                    className="ml-2 h-[40px] shrink-0 rounded-[8px] bg-[#F3F6FA] px-4 text-[14px] font-semibold text-[#3D4A5C] hover:bg-[#E3E8EF] disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {checkEmailMutation.isPending ? "확인 중" : "중복 확인"}
                                </button>
                            </div>
                            {errors.user_email && <p className={errorClass}>{errors.user_email.message}</p>}
                            {!errors.user_email && emailCheckMessage && (
                                <p className={emailChecked ? "mt-1 text-[12px] text-[#0E7C70]" : errorClass}>
                                    {emailCheckMessage}
                                </p>
                            )}
                        </label>

                        {/* 비밀번호 */}
                        <label className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">비밀번호</span>
                            <div
                                className={`mt-2 flex h-[52px] items-center rounded-[10px] border px-4 ${
                                    errors.user_password ? "border-[#E5484D]" : "border-[#D5DCE6] focus-within:border-[#0B1B33]"
                                }`}
                            >
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="영문 · 숫자 · 특수문자 8자 이상"
                                    className="min-w-0 flex-1 text-[16px] outline-none"
                                    {...register("user_password", {
                                        required: "비밀번호를 입력해 주세요.",
                                        pattern: {
                                            value: passwordRegex,
                                            message: "영문 · 숫자 · 특수문자를 섞어 8자 이상 입력해 주세요.",
                                        },
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="ml-2 shrink-0 text-[13px] text-[#6B7A90] cursor-pointer"
                                >
                                    {showPassword ? "숨김" : "표시"}
                                </button>
                            </div>
                            {errors.user_password && <p className={errorClass}>{errors.user_password.message}</p>}
                        </label>

                        {/* 비밀번호 확인 */}
                        <label className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">비밀번호 확인</span>
                            <input
                                type="password"
                                placeholder="비밀번호를 한 번 더 입력해 주세요"
                                className={inputClass(!!errors.passwordConfirm)}
                                {...register("passwordConfirm", {
                                    required: "비밀번호 확인을 입력해 주세요.",
                                    validate: (value) => value === getValues("user_password") || "비밀번호가 일치하지 않습니다.",
                                })}
                            />
                            {errors.passwordConfirm && <p className={errorClass}>{errors.passwordConfirm.message}</p>}
                        </label>

                        {/* 닉네임 */}
                        <label className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">닉네임</span>
                            <input
                                type="text"
                                placeholder="사용할 닉네임을 입력해 주세요"
                                className={inputClass(!!errors.user_nickname)}
                                {...register("user_nickname", {
                                    required: "닉네임을 입력해 주세요.",
                                })}
                            />
                            {errors.user_nickname && <p className={errorClass}>{errors.user_nickname.message}</p>}
                        </label>
                    </section>

                    {/* 사업자 상태 */}
                    <section className="mt-12 border-t border-[#E3E8EF] pt-10">
                        <h2 className="flex items-baseline gap-2 text-[22px] font-bold text-[#0B1B33]">
                            사업자 상태
                        </h2>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {BUSINESS_STATUSES.map((status) => {
                                const isSelected = businessStatus === status.value;
                                return (
                                    <label
                                        key={status.value}
                                        className={`cursor-pointer rounded-full border px-4 py-2 text-[14px] transition-colors ${
                                            isSelected
                                                ? "border-[#0B1B33] bg-[#0B1B33] text-white"
                                                : "border-[#D5DCE6] bg-white text-[#3D4A5C] hover:bg-[#F3F6FA]"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value={status.value}
                                            className="sr-only"
                                            {...register("user_business_status", { required: true })}
                                        />
                                        {status.label}
                                    </label>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-[12px] text-[#6B7A90]">상태에 따라 맞춤 지원사업이 달라져요. 마이페이지에서 바꿀 수 있어요.</p>
                    </section>

                    {/* 약관 동의 */}
                    <section className="mt-12 border-t border-[#E3E8EF] pt-10">
                        <h2 className="flex items-baseline gap-2 text-[22px] font-bold text-[#0B1B33]">
                            약관 동의
                        </h2>

                        <label className="mt-6 flex cursor-pointer items-center gap-2 border-b border-[#E3E8EF] pb-4 text-[15px] font-bold text-[#0B1B33]">
                            <input
                                type="checkbox"
                                checked={!!isAllAgreed}
                                onChange={(e) => handleAllAgree(e.target.checked)}
                                className="size-4 cursor-pointer"
                            />
                            전체 동의
                        </label>

                        <div className="mt-4 flex flex-col gap-3 text-[14px] text-[#3D4A5C]">
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input type="checkbox" className="size-4 cursor-pointer" {...register("agree_terms")} />
                                    (필수) 서비스 이용약관
                                </label>
                                {/* 약관 내용은 아직 없음 , 보기 기능은 추후 연결????????? */}
                                <button type="button" className="text-[13px] text-[#8A96A8] cursor-pointer">보기 ›</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input type="checkbox" className="size-4 cursor-pointer" {...register("agree_privacy")} />
                                    (필수) 개인정보 수집 · 이용
                                </label>
                                <button type="button" className="text-[13px] text-[#8A96A8] cursor-pointer">보기 ›</button>
                            </div>
                            <label className="flex cursor-pointer items-center gap-2">
                                <input type="checkbox" className="size-4 cursor-pointer" {...register("agree_marketing")} />
                                (선택) 지원사업 마감 알림 받기
                            </label>
                        </div>
                        {!agreeTerms || !agreePrivacy ? (
                            <p className="mt-3 text-[12px] text-[#E5484D]">필수 약관에 동의해야 가입할 수 있어요.</p>
                        ) : null}
                    </section>

                    {/* 하단 버튼 */}
                    <div className="mt-12 flex justify-end">
                        <Link
                            href="/login"
                            className="flex h-[48px] items-center rounded-[10px] border border-[#D5DCE6] bg-white px-5 text-[14px] font-semibold text-[#3D4A5C]  mr-[15px] hover:bg-[#F3F6FA]"
                        >
                            ← 로그인으로
                        </Link>
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="h-[48px] rounded-[10px] bg-[#0B1B33] px-8 font-bold text-white transition-colors hover:bg-[#1F3A5F] disabled:cursor-not-allowed disabled:bg-[#E3E8EF] disabled:text-[#8A96A8] cursor-pointer"
                        >
                            {signUpMutation.isPending ? "가입 중..." : "가입하기"}
                        </button>
                    </div>
                    {/* 소셜 가입 */}
                    <div className="mt-12 flex items-center gap-3 text-[13px] text-[#8A96A8]">
                        <span className="h-px flex-1 bg-[#E3E8EF]" />
                        또는 소셜로 가입
                        <span className="h-px flex-1 bg-[#E3E8EF]" />
                    </div>
                    <div className="mt-12 flex justify-center gap-4">
                        {SOCIAL_BUTTONS.map((button) => (
                            <a
                                key={button.path}
                                href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/${button.path}`}
                                aria-label={button.label}
                                title={button.label}
                                className="size-12 rounded-full transition-opacity hover:opacity-85 cursor-pointer"
                            >
                                <img src={button.icon} alt="" className="size-full rounded-full" />
                            </a>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
}
