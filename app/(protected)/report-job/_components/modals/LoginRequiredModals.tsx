import Link from "next/link";
import { toLoginHref } from "@/lib/loginRedirect";
import ModalShell from "./ModalShell";

type Props = {
    onClose: () => void;
};

export default function LoginRequiredModal({ onClose }: Props) {
    return (
        <ModalShell onClose={onClose}>
            <div className="relative w-[600px] px-[40px] pt-[107px] pb-[43px] rounded-[24px] border border-[#e2e8f0] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="닫기"
                    className="absolute top-[40px] right-[40px] text-[30px] leading-none text-[#5a6b80] cursor-pointer transition-colors hover:text-[#14213d]"
                >
                    ✕
                </button>

                {/* 자물쇠 아이콘 */}
                <div className="mx-auto flex items-center justify-center w-[64px] h-[64px] rounded-full border border-[rgba(26,59,113,0.4)]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3b71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        <circle cx="12" cy="16" r="1" fill="#1a3b71" />
                    </svg>
                </div>

                <p className="mt-[22px] text-center text-[28px] font-bold leading-[1.4] text-[#14213d]">
                    로그인이 필요한 서비스입니다.
                </p>

                {/* TODO: 팀 로그인/회원가입 경로로 맞춰 주세요 */}
                {/* 로그인하고 나면 지금 보던 페이지로 돌아오도록 주소를 함께 보낸다 (이 모달은 눌러서 열린 뒤에만 그려져서 브라우저 주소를 쓸 수 있다) */}
                <Link
                    href={toLoginHref()}
                    className="mt-[27px] flex items-center justify-center h-[54px] rounded-[10px] bg-[#1a3b71] text-[20px] font-bold text-white transition-colors hover:bg-[#23498a]"
                >
                    로그인
                </Link>
                <Link
                    href="/join"
                    className="mt-[12px] flex items-center justify-center h-[56px] rounded-[12px] border border-[#cbd5e1] bg-white text-[20px] font-bold text-[#5a6b80] transition-colors hover:bg-[#f7f9fc]"
                >
                    회원가입
                </Link>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-[27px] block mx-auto text-[14px] font-medium text-[#5a6b80] cursor-pointer hover:underline"
                >
                    나중에 할게요
                </button>
            </div>
        </ModalShell>
    );
}