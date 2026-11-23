"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "@/api/auth/auth.api";
import { LoginRequestDTO } from "@/types/auth/auth.type";
import { ApiResponseDTO } from "@/types/common/common.type";
import useAuthStore from "@/stores/useAuthStore";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 소셜 로그인 버튼 목록 (path: 백엔드 OAuth 시작 경로 /auth/{path})
// 아이콘 이미지는 public/assets/icons 에 있음 (원형 배경이 이미지에 포함됨)
const SOCIAL_BUTTONS = [
    { path: "kakao", label: "카카오로 로그인", icon: "/assets/icons/login_Kakao_icon.png" },
    { path: "naver", label: "네이버로 로그인", icon: "/assets/icons/login_Naver_icon.png" },
    { path: "google", label: "구글로 로그인", icon: "/assets/icons/login_Google_icon.png" },
];

// 로그인 페이지
export default function Login() {
    const router = useRouter();
    const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
    } = useForm<LoginRequestDTO>({ mode: "onChange" });

    // 로그인 mutation
    const loginMutation = useMutation({
        mutationFn: loginApi,
        onSuccess: (datas: ApiResponseDTO) => {
            setIsAuthenticated(true);
            alert(datas.message);
            router.push("/");
        },
        onError: (err: Error) => {
            alert(err.message || "이메일 또는 비밀번호가 맞지 않습니다. 다시 확인해 주세요.");
        },
    });

    const onSubmit = (loginRequestDTO: LoginRequestDTO) => {
        // rememberMe는 백엔드 연동 전까지 화면 상태만 유지
        loginMutation.mutate(loginRequestDTO);
    };

    const isDisabled = !isValid || isSubmitting || loginMutation.isPending;

    return (
        <div className="flex justify-center items-center px-4 pt-[150px] pb-[120px] min-h-screen bg-white px-[5%]">
            <div className="flex flex-col justify-center items-center w-full max-w-[700px]">
                <h1 className="text-[40px] font-bold text-[#0B1B33]">로그인</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-[64px] flex w-full flex-col">
                    {/* 이메일 */}
                    <label className="flex flex-col">
                        <span className="text-[15px] font-bold text-[#0B1B33]">이메일</span>
                        <input
                            type="text"
                            placeholder="이메일 주소를 입력해 주세요"
                            className={`mt-2 h-[52px] rounded-[10px] border px-4 text-[16px] outline-none ${
                                errors.user_email ? "border-[#E5484D]" : "border-[#D5DCE6] focus:border-[#0B1B33]"
                            }`}
                            {...register("user_email", {
                                required: "이메일을 입력해 주세요.",
                                pattern: { value: emailRegex, message: "이메일 양식에 맞게 입력해 주세요." },
                            })}
                        />
                        {errors.user_email && (
                            <p className="mt-1 text-[12px] text-[#E5484D]">{errors.user_email.message}</p>
                        )}
                    </label>

                    {/* 비밀번호 */}
                    <label className="mt-6 flex flex-col">
                        <span className="text-[15px] font-bold text-[#0B1B33]">비밀번호</span>
                        <div className={`mt-2 flex h-[52px] items-center rounded-[10px] border px-4 ${
                            errors.user_password ? "border-[#E5484D]" : "border-[#D5DCE6] focus-within:border-[#0B1B33]"
                        }`}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="비밀번호를 입력해 주세요"
                                className="min-w-0 flex-1 text-[16px] outline-none"
                                {...register("user_password", {
                                    required: "비밀번호를 입력해 주세요.",
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
                        {errors.user_password && (
                            <p className="mt-1 text-[12px] text-[#E5484D]">{errors.user_password.message}</p>
                        )}
                    </label>

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

                    {/* 로그인 버튼 */}
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
