import Link from "next/link";
import ModalShell from "./ModalShell";

type Props = {
    onClose: () => void;
};

export default function PremiumModal({ onClose }: Props) {
    return (
        <ModalShell onClose={onClose}>
            <div className="w-[720px] p-[48px] rounded-[24px] bg-white shadow-[0_30px_80px_rgba(7,16,31,0.3)]">
                <div className="flex items-center gap-[29px]">
                    {/* 다이아몬드 아이콘 */}
                    <div className="shrink-0 flex items-center justify-center w-[77px] h-[77px] rounded-[20px] bg-[#eaf8f6]">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0b7468" strokeWidth="1.6" strokeLinejoin="round">
                            <path d="M6 3h12l4 6-10 12L2 9z" />
                            <path d="M2 9h20M9 3l3 6 3-6M12 21 9 9M12 21l3-12" />
                        </svg>
                    </div>
                    <p className="text-[34px] font-bold leading-[1.5] text-[#111]">Premium 기능이에요</p>
                </div>

                <p className="mt-[24px] text-[20px] leading-[1.5] text-[#6b6b6b]">
                    기획서 AI 분석은 구독 회원만 이용할 수 있어요.
                    <br />
                    구독하면 검토 결과와 PDF 보고서를 받아볼 수 있어요.
                </p>

                <div className="mt-[40px] flex justify-end gap-[12px]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-[92px] h-[67px] rounded-[12px] border border-[#e3e8ef] bg-white shadow-[0_4px_14px_rgba(11,27,51,0.05)] text-[19px] font-semibold text-[#3a4456] cursor-pointer transition-colors hover:bg-[#f7f9fc]"
                    >
                        취소
                    </button>
                    {/* TODO: 구독 페이지 경로로 맞춰 주세요 */}
                    <Link
                        href="/subscribe"
                        className="group flex items-center justify-center gap-[10px] w-[200px] h-[67px] rounded-full bg-[#13284a] text-[20px] font-bold text-white transition-colors hover:bg-[#1d3a66]"
                    >
                        구독 알아보기
                        <span className="transition-transform group-hover:translate-x-[3px]">→</span>
                    </Link>
                </div>
            </div>
        </ModalShell>
    );
}