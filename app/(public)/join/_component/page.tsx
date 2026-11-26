"use client"

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { checkEmailApi, signUpApi } from "@/api/auth/auth.api";
import { ErrorSummary, FieldCheck, FieldMessage, goToField, shakeClass } from "@/components/form/FormMotion";
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

// 성별 선택지
const SEX_OPTIONS = [
    { value: "male", label: "남성" },
    { value: "female", label: "여성" },
] as const;

// 휴대폰 번호 (하이픈 포함/미포함 모두 허용)
const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
// 전송 시 010-1234-5678 형태로 통일
const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 11
        ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
        : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};
// 오늘 날짜 (로컬 기준 YYYY-MM-DD)
const getToday = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// 폼타입 (약관 체크 포함)
interface JoinFormValues {
    user_email: string;
    user_password: string;
    passwordConfirm: string;
    user_name: string;
    user_nickname: string;
    user_sex: "male" | "female";
    user_birth: string;
    user_phone: string;
    user_business_status: string;
    agree_terms: boolean;
    agree_privacy: boolean;
    agree_marketing: boolean;
}

// 틀린 항목 요약에 나오는 칸들 (화면 순서대로). 소셜 가입에서는 비밀번호 칸이 없다.
const SUMMARY_FIELDS: { name: keyof JoinFormValues; label: string; passwordOnly?: boolean }[] = [
    { name: "user_email", label: "이메일" },
    { name: "user_password", label: "비밀번호", passwordOnly: true },
    { name: "passwordConfirm", label: "비밀번호 확인", passwordOnly: true },
    { name: "user_nickname", label: "닉네임" },
    { name: "user_name", label: "이름" },
    { name: "user_sex", label: "성별" },
    { name: "user_birth", label: "생년월일" },
    { name: "user_phone", label: "휴대폰 번호" },
    { name: "agree_terms", label: "서비스 이용약관" },
    { name: "agree_privacy", label: "개인정보 수집 · 이용" },
];

// 회원가입 페이지
export default function JoinSignUp() {
    const router = useRouter();

    // 소셜 가입 모드: 백엔드가 /join?user_email=&user_provider=&user_provider_id= 로 리다이렉트
    const searchParams = useSearchParams();
    const socialEmail = searchParams.get("user_email") ?? "";
    const socialProvider = searchParams.get("user_provider") ?? "";
    const socialProviderId = searchParams.get("user_provider_id") ?? "";
    const isSocial = !!socialEmail && !!socialProvider && !!socialProviderId;
    // 소셜에서 이름을 받아왔으면 수정 불가로 채운다 (못 받아왔으면 직접 입력)
    const socialName = isSocial ? searchParams.get("user_name") ?? "" : "";

    // 이메일 중복 확인 결과 (이메일이 바뀌면 다시 확인해야 함)
    const [emailChecked, setEmailChecked] = useState(false);
    const [emailCheckMessage, setEmailCheckMessage] = useState("");
    // 비밀번호 표시/숨김
    const [showPassword, setShowPassword] = useState(false);
    // 틀린 칸이 흔들리는 횟수(제출·가입 실패마다 늘어난다), 위쪽 요약에 올라온 칸들, 서버가 돌려준 가입 실패 문구
    const [shakeKey, setShakeKey] = useState(0);
    const [summaryNames, setSummaryNames] = useState<(keyof JoinFormValues)[]>([]);
    const [serverError, setServerError] = useState<string | null>(null);

    // 처음 누를 때 검사하고, 그 뒤로는 고치는 즉시 다시 검사한다 (오류 문구가 접히고 체크가 생기며 요약 숫자가 줄어든다)
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        clearErrors,
        reset,
        control,
        formState: { errors, isSubmitted, isSubmitting },
    } = useForm<JoinFormValues>({
        mode: "onSubmit",
        reValidateMode: "onChange",
        shouldFocusError: false,
        defaultValues: { user_business_status: "PREPARING", user_email: socialEmail, user_name: socialName },
    });

    // 페이지를 벗어나면 입력한 내용(비밀번호 포함)과 오류 표시를 모두 비운다.
    // 이 프로젝트는 벗어난 페이지의 화면 상태를 메모리에 남겨 두기 때문에, 비우지 않으면 다시 들어왔을 때 그대로 보인다.
    useEffect(() => {
        return () => {
            reset();
            setEmailChecked(false);
            setEmailCheckMessage("");
            setShowPassword(false);
            setShakeKey(0);
            setSummaryNames([]);
            setServerError(null);
        };
    }, [reset]);

    const values = useWatch({ control });
    const agreeTerms = values.agree_terms;
    const agreePrivacy = values.agree_privacy;
    const agreeMarketing = values.agree_marketing;
    const businessStatus = values.user_business_status;
    const userSex = values.user_sex;
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
                clearErrors("user_email"); // 제출 때 붙은 "중복 확인을 해주세요" 오류를 바로 걷는다
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
            setServerError(err.message);
            setShakeKey((k) => k + 1);
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
        setValue("agree_terms", checked, { shouldValidate: isSubmitted });
        setValue("agree_privacy", checked, { shouldValidate: isSubmitted });
        setValue("agree_marketing", checked, { shouldValidate: isSubmitted });
    };

    const onSubmit = (values: JoinFormValues) => {
        if (!isSocial && !emailChecked) return; // 이메일 칸의 검사에서 이미 걸러진다
        setServerError(null);
        const payload: SignUpRequestDTO = {
            user_email: values.user_email,
            ...(isSocial
                ? { user_provider: socialProvider, user_provider_id: socialProviderId }
                : { user_password: values.user_password }),
            user_name: values.user_name.trim(),
            user_nickname: values.user_nickname,
            user_sex: values.user_sex,
            user_birth: values.user_birth,
            user_phone: formatPhone(values.user_phone),
            user_business_status: values.user_business_status,
            agree_terms: values.agree_terms,
            agree_privacy: values.agree_privacy,
            agree_marketing: values.agree_marketing,
        };
        signUpMutation.mutate(payload);
    };

    // 틀린 칸이 있으면 흔들고, 위쪽에 요약을 내린 뒤 첫 번째 틀린 칸으로 부드럽게 올라가 커서를 놓는다
    const onInvalid = (errs: FieldErrors<JoinFormValues>) => {
        const bad = SUMMARY_FIELDS.filter((f) => !(isSocial && f.passwordOnly) && errs[f.name]).map((f) => f.name);
        setServerError(null);
        setSummaryNames(bad);
        setShakeKey((k) => k + 1);
        if (bad.length > 0) window.setTimeout(() => goToField(`join-field-${bad[0]}`), 200);
    };

    const isDisabled = isSubmitting || signUpMutation.isPending;

    const summaryItems = summaryNames.map((name) => ({
        name,
        label: SUMMARY_FIELDS.find((f) => f.name === name)?.label ?? name,
        invalid: !!errors[name],
    }));

    // 칸을 고쳐서 맞으면 초록 테두리·체크 (처음 누르기 전에는 표시하지 않는다)
    const isGood = (name: keyof JoinFormValues) => isSubmitted && !errors[name] && !!values[name];
    const shake = (name: keyof JoinFormValues) => shakeClass(shakeKey, !!errors[name]);

    // 에러 여부에 따라 테두리 색 변경 (빨강 / 고침 초록 / 기본 + 포커스 시 진한 남색)
    const inputClass = (name: keyof JoinFormValues) =>
        `h-[52px] w-full rounded-[10px] border pl-4 pr-11 text-[16px] outline-none transition-colors ${
            errors[name]
                ? "border-[#E5484D]"
                : isGood(name)
                  ? "border-sub-700/60"
                  : "border-[#D5DCE6] focus:border-[#0B1B33]"
        }`;

    return (
        <div className="flex flex-col items-center px-4 pt-[150px] pb-[120px] min-h-screen bg-white">
            <div className="flex flex-col justify-center items-center w-full max-w-[700px]">
                <h1 className="text-[40px] font-bold text-[#0B1B33]">회원가입</h1>

                <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="mt-[64px] flex w-full flex-col">
                    {/* 틀린 항목 요약: 가입하기를 누르면 내려오고, 고치면 줄이 그어지며 숫자가 줄어든다 */}
                    <ErrorSummary items={summaryItems} onGo={(name) => goToField(`join-field-${name}`)} />

                    {/* 계정 정보 */}
                    <section>
                        <h2 className="flex items-baseline gap-2 text-[22px] font-bold text-[#0B1B33]">
                            계정 정보
                        </h2>

                        {/* 이메일 + 중복 확인 */}
                        <label id="join-field-user_email" className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">이메일<span className="ml-0.5 text-[#E5484D]">*</span></span>
                            {/* 입력창 테두리 안 오른쪽에 중복 확인 버튼 */}
                            <div className={shake("user_email")}>
                                <div
                                    className={`mt-2 flex h-[52px] items-center rounded-[10px] border pl-4 pr-[6px] transition-colors ${
                                        emailHasError
                                            ? "border-[#E5484D]"
                                            : emailChecked
                                              ? "border-sub-700/60"
                                              : "border-[#D5DCE6] focus-within:border-[#0B1B33]"
                                    } ${isSocial ? "bg-[#F3F6FA]" : ""}`}
                                >
                                    <input
                                        type="text"
                                        placeholder="example@startfit.kr"
                                        readOnly={isSocial}
                                        aria-invalid={emailHasError}
                                        className={`min-w-0 flex-1 bg-transparent text-[16px] outline-none ${
                                            isSocial ? "cursor-not-allowed text-[#6B7A90]" : ""
                                        }`}
                                        {...register("user_email", {
                                            required: "이메일을 입력해 주세요.",
                                            pattern: { value: emailRegex, message: "이메일 양식에 맞게 입력해 주세요." },
                                            validate: () => isSocial || emailChecked || "이메일 중복 확인을 해주세요.",
                                            onChange: () => {
                                                setEmailChecked(false);
                                                setEmailCheckMessage("");
                                            },
                                        })}
                                    />
                                    {isSocial ? (
                                        <span className="ml-2 shrink-0 pr-2 text-[13px] text-[#6B7A90]">
                                            {socialProvider} 인증됨
                                        </span>
                                    ) : (
                                        <>
                                        {/* 중복 확인을 통과하면 체크 */}
                                        <FieldCheck inline show={emailChecked && !errors.user_email} className="ml-2" />
                                        <button
                                            type="button"
                                            onClick={handleCheckEmail}
                                            disabled={checkEmailMutation.isPending}
                                            className="ml-2 h-[40px] shrink-0 rounded-[8px] bg-[#F3F6FA] px-4 text-[14px] font-semibold text-[#3D4A5C] hover:bg-[#E3E8EF] disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {checkEmailMutation.isPending ? "확인 중" : "중복 확인"}
                                        </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <FieldMessage
                                message={errors.user_email?.message ?? (emailChecked ? null : emailCheckMessage || null)}
                            />
                            {/* 사용할 수 있는 이메일이라는 확인 문구 (오류가 아니라 초록색) */}
                            <div
                                className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.3,1,0.4,1)] motion-reduce:transition-none ${
                                    !errors.user_email && emailChecked && emailCheckMessage ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                }`}
                            >
                                <div className="min-h-0 overflow-hidden">
                                    <p className="pt-1 text-[12px] text-[#0E7C70]">{emailCheckMessage}</p>
                                </div>
                            </div>
                        </label>

                        {/* 비밀번호 / 비밀번호 확인 (소셜 가입에서는 숨김) */}
                        {!isSocial && (<>
                        <label id="join-field-user_password" className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">비밀번호<span className="ml-0.5 text-[#E5484D]">*</span></span>
                            <div className={`mt-2 ${shake("user_password")}`}>
                                <div
                                    className={`flex h-[52px] items-center rounded-[10px] border px-4 transition-colors ${
                                        errors.user_password
                                            ? "border-[#E5484D]"
                                            : isGood("user_password")
                                              ? "border-sub-700/60"
                                              : "border-[#D5DCE6] focus-within:border-[#0B1B33]"
                                    }`}
                                >
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="영문 · 숫자 · 특수문자 8자 이상"
                                        aria-invalid={!!errors.user_password}
                                        className="min-w-0 flex-1 text-[16px] outline-none"
                                        {...register("user_password", {
                                            required: "비밀번호를 입력해 주세요.",
                                            pattern: {
                                                value: passwordRegex,
                                                message: "영문 · 숫자 · 특수문자를 섞어 8자 이상 입력해 주세요.",
                                            },
                                        })}
                                    />
                                    <FieldCheck inline show={isGood("user_password")} className="ml-2" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="ml-2 shrink-0 text-[13px] text-[#6B7A90] cursor-pointer"
                                    >
                                        {showPassword ? "숨김" : "표시"}
                                    </button>
                                </div>
                            </div>
                            <FieldMessage message={errors.user_password?.message} />
                        </label>

                        {/* 비밀번호 확인 */}
                        <label id="join-field-passwordConfirm" className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">비밀번호 확인<span className="ml-0.5 text-[#E5484D]">*</span></span>
                            <div className={`relative mt-2 ${shake("passwordConfirm")}`}>
                                <input
                                    type="password"
                                    placeholder="비밀번호를 한 번 더 입력해 주세요"
                                    aria-invalid={!!errors.passwordConfirm}
                                    className={inputClass("passwordConfirm")}
                                    {...register("passwordConfirm", {
                                        required: "비밀번호 확인을 입력해 주세요.",
                                        validate: (value) => value === getValues("user_password") || "비밀번호가 일치하지 않습니다.",
                                    })}
                                />
                                <FieldCheck show={isGood("passwordConfirm")} />
                            </div>
                            <FieldMessage message={errors.passwordConfirm?.message} />
                        </label>
                        </>)}

                        {/* 닉네임 */}
                        <label id="join-field-user_nickname" className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">닉네임<span className="ml-0.5 text-[#E5484D]">*</span></span>
                            <div className={`relative mt-2 ${shake("user_nickname")}`}>
                                <input
                                    type="text"
                                    placeholder="사용할 닉네임을 입력해 주세요"
                                    aria-invalid={!!errors.user_nickname}
                                    className={inputClass("user_nickname")}
                                    {...register("user_nickname", {
                                        required: "닉네임을 입력해 주세요.",
                                    })}
                                />
                                <FieldCheck show={isGood("user_nickname")} />
                            </div>
                            <FieldMessage message={errors.user_nickname?.message} />
                        </label>
                    </section>

                    {/* 기본 정보 */}
                    <section className="mt-12 border-t border-[#E3E8EF] pt-10">
                        <h2 className="flex items-baseline gap-2 text-[22px] font-bold text-[#0B1B33]">
                            기본 정보
                        </h2>

                        {/* 이름 */}
                        <label id="join-field-user_name" className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">이름<span className="ml-0.5 text-[#E5484D]">*</span></span>
                            <div className={`relative mt-2 ${shake("user_name")}`}>
                                <input
                                    type="text"
                                    placeholder="실명을 입력해 주세요"
                                    readOnly={!!socialName}
                                    aria-invalid={!!errors.user_name}
                                    className={`${inputClass("user_name")} ${
                                        socialName ? "cursor-not-allowed bg-[#F3F6FA] text-[#6B7A90]" : ""
                                    }`}
                                    {...register("user_name", {
                                        validate: (value) => value.trim().length > 0 || "이름을 입력해 주세요.",
                                    })}
                                />
                                <FieldCheck show={isGood("user_name")} />
                            </div>
                            <FieldMessage message={errors.user_name?.message} />
                        </label>

                        {/* 성별 */}
                        <div id="join-field-user_sex" className="mt-6 flex flex-col">
                            <span className="flex items-center gap-2 text-[15px] font-bold text-[#0B1B33]">
                                <span>성별<span className="ml-0.5 text-[#E5484D]">*</span></span>
                                <FieldCheck inline show={isGood("user_sex")} />
                            </span>
                            <div className={`mt-2 flex gap-2 ${shake("user_sex")}`}>
                                {SEX_OPTIONS.map((option) => {
                                    const isSelected = userSex === option.value;
                                    return (
                                        <label
                                            key={option.value}
                                            className={`cursor-pointer rounded-full border px-4 py-2 text-[14px] transition-colors ${
                                                isSelected
                                                    ? "border-[#0B1B33] bg-[#0B1B33] text-white"
                                                    : errors.user_sex
                                                      ? "border-[#E5484D] bg-white text-[#3D4A5C] hover:bg-[#F3F6FA]"
                                                      : "border-[#D5DCE6] bg-white text-[#3D4A5C] hover:bg-[#F3F6FA]"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                value={option.value}
                                                className="sr-only"
                                                {...register("user_sex", { required: "성별을 선택해 주세요." })}
                                            />
                                            {option.label}
                                        </label>
                                    );
                                })}
                            </div>
                            <FieldMessage message={errors.user_sex?.message} />
                        </div>

                        {/* 생년월일 */}
                        <label id="join-field-user_birth" className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">생년월일<span className="ml-0.5 text-[#E5484D]">*</span></span>
                            <div className={`relative mt-2 ${shake("user_birth")}`}>
                                <input
                                    type="date"
                                    max={getToday()}
                                    aria-invalid={!!errors.user_birth}
                                    className={inputClass("user_birth")}
                                    {...register("user_birth", {
                                        required: "생년월일을 입력해 주세요.",
                                        validate: (value) => value <= getToday() || "오늘 이후 날짜는 선택할 수 없어요.",
                                    })}
                                />
                                {/* 날짜 선택 아이콘이 오른쪽 끝에 있어서 그 왼쪽에 둔다 */}
                                <FieldCheck show={isGood("user_birth")} className="right-11" />
                            </div>
                            <FieldMessage message={errors.user_birth?.message} />
                        </label>

                        {/* 휴대폰 번호 */}
                        <label id="join-field-user_phone" className="mt-6 flex flex-col">
                            <span className="text-[15px] font-bold text-[#0B1B33]">휴대폰 번호<span className="ml-0.5 text-[#E5484D]">*</span></span>
                            <div className={`relative mt-2 ${shake("user_phone")}`}>
                                <input
                                    type="tel"
                                    placeholder="010-1234-5678"
                                    aria-invalid={!!errors.user_phone}
                                    className={inputClass("user_phone")}
                                    {...register("user_phone", {
                                        required: "휴대폰 번호를 입력해 주세요.",
                                        pattern: { value: phoneRegex, message: "휴대폰 번호 형식에 맞게 입력해 주세요." },
                                    })}
                                />
                                <FieldCheck show={isGood("user_phone")} />
                            </div>
                            <FieldMessage message={errors.user_phone?.message} />
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
                            <div id="join-field-agree_terms">
                                <div className={`flex items-center justify-between ${shake("agree_terms")}`}>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            aria-invalid={!!errors.agree_terms}
                                            className="size-4 cursor-pointer"
                                            {...register("agree_terms", { required: "서비스 이용약관에 동의해 주세요." })}
                                        />
                                        (필수) 서비스 이용약관
                                    </label>
                                    {/* 약관 내용은 아직 없음 , 보기 기능은 추후 연결????????? */}
                                    <span className="flex items-center gap-2">
                                        <FieldCheck inline show={isGood("agree_terms")} />
                                        <button type="button" className="text-[13px] text-[#8A96A8] cursor-pointer">보기 ›</button>
                                    </span>
                                </div>
                                <FieldMessage message={errors.agree_terms?.message} />
                            </div>
                            <div id="join-field-agree_privacy">
                                <div className={`flex items-center justify-between ${shake("agree_privacy")}`}>
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            aria-invalid={!!errors.agree_privacy}
                                            className="size-4 cursor-pointer"
                                            {...register("agree_privacy", { required: "개인정보 수집 · 이용에 동의해 주세요." })}
                                        />
                                        (필수) 개인정보 수집 · 이용
                                    </label>
                                    <span className="flex items-center gap-2">
                                        <FieldCheck inline show={isGood("agree_privacy")} />
                                        <button type="button" className="text-[13px] text-[#8A96A8] cursor-pointer">보기 ›</button>
                                    </span>
                                </div>
                                <FieldMessage message={errors.agree_privacy?.message} />
                            </div>
                            <label className="flex cursor-pointer items-center gap-2">
                                <input type="checkbox" className="size-4 cursor-pointer" {...register("agree_marketing")} />
                                (선택) 지원사업 마감 알림 받기
                            </label>
                        </div>
                    </section>

                    {/* 서버가 돌려준 가입 실패 (이미 가입된 정보 등) */}
                    <FieldMessage message={serverError} className="mt-8 text-right text-[13px] font-bold" />

                    {/* 하단 버튼 (항상 누를 수 있고, 틀린 칸이 있으면 흔들리며 알려 준다) */}
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
                    {/* 소셜 가입 (소셜 가입 모드에서는 숨김) */}
                    {!isSocial && (<>
                    <div className="mt-12 flex items-center gap-3 text-[13px] text-[#8A96A8]">
                        <span className="h-px flex-1 bg-[#E3E8EF]" />
                        또는 소셜로 가입
                        <span className="h-px flex-1 bg-[#E3E8EF]" />
                    </div>
                    <div className="mt-12 flex justify-center gap-10">
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
                    </>)}
                </form>
            </div>
        </div>
    );
}
