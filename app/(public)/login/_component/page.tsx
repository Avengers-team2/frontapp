"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { getMeApi, loginApi } from "@/api/auth/auth.api";
import { FieldCheck, FieldMessage, goToField, shakeClass } from "@/components/form/FormMotion";
import { LoginRequestDTO } from "@/types/auth/auth.type";
import { readNextPath } from "@/lib/loginRedirect";
import useAuthStore from "@/stores/useAuthStore";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 소셜 로그인 버튼 목록 (path: 경로 /auth/{path})
const SOCIAL_BUTTONS = [
    { path: "kakao", label: "카카오로 로그인", icon: "/assets/icons/login_Kakao_icon.png" },
    { path: "naver", label: "네이버로 로그인", icon: "/assets/icons/login_Naver_icon.png" },
    { path: "google", label: "구글로 로그인", icon: "/assets/icons/login_Google_icon.png" },
];

const LOGIN_FAIL_MESSAGE = "이메일 또는 비밀번호가 맞지 않습니다. 다시 확인해 주세요.";

// 로그인 페이지
export default function Login() {
    const router = useRouter();
    const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
    const setUser = useAuthStore((state) => state.setUser);

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    // 틀린 칸이 흔들리는 횟수(제출·로그인 실패마다 늘어난다)와 서버가 돌려준 로그인 실패 문구
    const [shakeKey, setShakeKey] = useState(0);
    const [serverError, setServerError] = useState<string | null>(null);

    // 처음 누를 때 검사하고, 그 뒤로는 고치는 즉시 다시 검사한다 (오류 문구가 접히고 체크가 생긴다)
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitted, isSubmitting },
    } = useForm<LoginRequestDTO>({ mode: "onSubmit", reValidateMode: "onChange", shouldFocusError: false });

    // 페이지를 벗어나면 입력한 이메일·비밀번호와 오류 표시를 비운다.
    // 이 프로젝트는 벗어난 페이지의 화면 상태를 메모리에 남겨 두기 때문에, 비우지 않으면 다시 들어왔을 때 그대로 보인다.
    useEffect(() => {
        return () => {
            reset();
            setShowPassword(false);
            setRememberMe(false);
            setShakeKey(0);
            setServerError(null);
        };
    }, [reset]);

    const values = useWatch({ control });

    // 로그인 mutation
    const loginMutation = useMutation({
        mutationFn: loginApi,
        onSuccess: async () => {
            // 헤더가 바로 바뀌도록 내 정보를 먼저 채운다 (실패해도 로그인 자체는 유지)
            try {
                const me = await getMeApi();
                setUser(me.data);
            } catch {
                // AuthHydration이 다음 로드 때 다시 채운다
            }
            setIsAuthenticated(true);
            // 원래 있던 페이지(?next=)가 있으면 그곳으로, 없으면 홈으로
            router.push(readNextPath());
        },
        onError: (err: Error) => {
            setServerError(err.message || LOGIN_FAIL_MESSAGE);
            setShakeKey((k) => k + 1);
        },
    });

    const onSubmit = (loginRequestDTO: LoginRequestDTO) => {
        // rememberMe는 백엔드 연동 전까지 화면 상태만 유지
        setServerError(null);
        loginMutation.mutate(loginRequestDTO);
    };

    // 틀린 칸이 있으면 흔들고, 첫 번째 틀린 칸으로 부드럽게 올라가 커서를 놓는다
    const onInvalid = (errs: FieldErrors<LoginRequestDTO>) => {
        setServerError(null);
        setShakeKey((k) => k + 1);
        const first = (["user_email", "user_password"] as const).find((name) => errs[name]);
        if (first) window.setTimeout(() => goToField(`login-field-${first}`), 200);
    };

    const isDisabled = isSubmitting || loginMutation.isPending;

    // 칸이 틀렸거나 로그인에 실패했으면 빨간 테두리, 고쳐서 맞으면 체크
    const emailBad = !!errors.user_email || !!serverError;
    const passwordBad = !!errors.user_password || !!serverError;
    const emailGood = isSubmitted && !emailBad && !!values.user_email;
    const passwordGood = isSubmitted && !passwordBad && !!values.user_password;

    return (
        <div className="flex justify-center items-center px-4 pt-[150px] pb-[120px] min-h-screen bg-white px-[5%]">
            <div className="flex flex-col justify-center items-center w-full max-w-[700px]">
                <h1 className="text-[40px] font-bold text-[#0B1B33]">로그인</h1>

                <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="mt-[64px] flex w-full flex-col">
                    {/* 이메일 */}
                    <label id="login-field-user_email" className="flex flex-col">
                        <span className="text-[15px] font-bold text-[#0B1B33]">이메일</span>
                        <div className={`relative mt-2 ${shakeClass(shakeKey, emailBad)}`}>
                            <input
                                type="text"
                                placeholder="이메일 주소를 입력해 주세요"
                                aria-invalid={emailBad}
                                className={`h-[52px] w-full rounded-[10px] border pl-4 pr-11 text-[16px] outline-none transition-colors ${
                                    emailBad
                                        ? "border-[#E5484D]"
                                        : emailGood
                                          ? "border-sub-700/60"
                                          : "border-[#D5DCE6] focus:border-[#0B1B33]"
                                }`}
                                {...register("user_email", {
                                    required: "이메일을 입력해 주세요.",
                                    pattern: { value: emailRegex, message: "이메일 양식에 맞게 입력해 주세요." },
                                    onChange: () => setServerError(null),
                                })}
                            />
                            <FieldCheck show={emailGood} />
                        </div>
                        <FieldMessage message={errors.user_email?.message} />
                    </label>

                    {/* 비밀번호 */}
                    <label id="login-field-user_password" className="mt-6 flex flex-col">
                        <span className="text-[15px] font-bold text-[#0B1B33]">비밀번호</span>
                        <div className={`relative mt-2 ${shakeClass(shakeKey, passwordBad)}`}>
                            <div
                                className={`flex h-[52px] items-center rounded-[10px] border pl-4 pr-11 transition-colors ${
                                    passwordBad
                                        ? "border-[#E5484D]"
                                        : passwordGood
                                          ? "border-sub-700/60"
                                          : "border-[#D5DCE6] focus-within:border-[#0B1B33]"
                                }`}
                            >
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="비밀번호를 입력해 주세요"
                                    aria-invalid={passwordBad}
                                    className="min-w-0 flex-1 text-[16px] outline-none"
                                    {...register("user_password", {
                                        required: "비밀번호를 입력해 주세요.",
                                        onChange: () => setServerError(null),
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
                            <FieldCheck show={passwordGood} />
                        </div>
                        <FieldMessage message={errors.user_password?.message} />
                    </label>

                    {/* 서버가 돌려준 로그인 실패 (이메일·비밀번호가 맞지 않음 등) */}
                    <FieldMessage message={serverError} className="text-[13px] font-bold" />

                    {/* 로그인 유지 + 아이디·비밀번호 찾기 버튼 */}
                    <div className="mt-4 flex items-center justify-between text-[14px]">
                        <label className="flex cursor-pointer items-center gap-2 text-[#3D4A5C]">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="size-4 cursor-pointer"
                            />
                            로그인 상태 유지
                        </label>
                        <Link href="/find-account" className="font-semibold text-[#0E7C70] hover:underline">
                            아이디 · 비밀번호 찾기
                        </Link>
                    </div>

                    {/* 로그인 버튼 (항상 누를 수 있고, 틀린 칸이 있으면 흔들리며 알려 준다) */}
                    <button
                        type="submit"
                        disabled={isDisabled}
                        className="mt-6 h-[52px] rounded-[10px] bg-[#0B1B33] font-bold text-white transition-colors hover:bg-[#1F3A5F] disabled:cursor-not-allowed disabled:bg-[#E3E8EF] disabled:text-[#8A96A8] cursor-pointer"
                    >
                        {loginMutation.isPending ? "로그인 중..." : "로그인"}
                    </button>

                    {/* 구분선 */}
                    <div className="mt-8 flex items-center gap-3 text-[13px] text-[#8A96A8]">
                        <span className="h-px flex-1 bg-[#E3E8EF]" />
                        또는
                        <span className="h-px flex-1 bg-[#E3E8EF]" />
                    </div>

                    {/* 소셜 로그인 */}
                    <div className="mt-6 flex justify-center gap-4">
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

                    <p className="mt-8 text-center text-[14px] text-[#6B7A90]">
                        처음이세요?{" "}
                        <Link href="/join" className="font-bold text-[#0E7C70] underline">
                            회원가입
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
