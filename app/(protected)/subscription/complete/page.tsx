import Link from "next/link";
import { FIT } from "../_lib/fit";
import { PLAN, formatWon, getMethodLabel } from "../_lib/plan";

type Props = {
    searchParams: Promise<{ method?: string; next?: string }>;
};

export default async function SubscriptionCompletePage({ searchParams }: Props) {
    const { method, next } = await searchParams;

    const rows = [
        ["구독 상품", PLAN.name],
        ["결제 금액", formatWon(PLAN.price)],
        ["결제 수단", getMethodLabel(method)],
        ["다음 결제일", next ?? "-"],
    ];

    return (
        // pt: 헤더 높이 (다른 페이지와 동일)
        <div className="pt-[96px] overflow-x-hidden">
            <section className={FIT}>
                <style>{`
                    @keyframes sub-check-draw {
                        from { stroke-dashoffset: 70; }
                        to { stroke-dashoffset: 0; }
                    }
                `}</style>

                <div className="w-[720px] mx-auto pt-[79px] pb-[116px] text-center">
                    {/* 완료 체크 아이콘 */}
                    <svg
                        width="112"
                        height="112"
                        viewBox="0 0 112 112"
                        className="mx-auto animate-in zoom-in-50 fade-in duration-500"
                    >
                        <defs>
                            <linearGradient id="sub-done" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#5ef0dc" />
                                <stop offset="100%" stopColor="#2bb3a3" />
                            </linearGradient>
                        </defs>
                        <circle cx="56" cy="56" r="56" fill="url(#sub-done)" />
                        <path
                            d="M36 57l13 13 27-28"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="70"
                            style={{ animation: "sub-check-draw 0.5s ease-out 0.35s both" }}
                        />
                    </svg>

                    <div
                        className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                        style={{ animationDelay: "200ms", animationFillMode: "both" }}
                    >
                        <h1 className="mt-[47px] text-[48px] font-bold text-[#111]">Premium 구독이 시작됐어요</h1>
                        <p className="mt-[10px] text-[19px] text-[#6b6b6b]">
                            이제 기획서를 올리고 AI 검토와 PDF 보고서를 받아볼 수 있어요.
                        </p>

                        {/* 구독 정보 */}
                        <dl className="mt-[47px] px-[40px] py-[32px] rounded-[16px] bg-[#f7f9fb] flex flex-col gap-[15px] text-[19px] text-left">
                            {rows.map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                    <dt className="text-[#5b6577]">{key}</dt>
                                    <dd className="font-semibold text-[#111]">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        {/* 버튼 */}
                        <div className="mt-[40px] flex justify-center gap-[12px]">
                            <Link
                                href="/report-job"
                                className="group flex items-center justify-center gap-[10px] w-[264px] h-[64px] rounded-full bg-linear-to-r from-[#13284a] via-[#1d5466] via-55% to-[#2bb3a3] text-[20px] font-bold text-white transition-all duration-300 hover:brightness-110"
                            >
                                기획서 올리러 가기
                                <span className="transition-transform duration-300 group-hover:translate-x-[4px]">→</span>
                            </Link>
                            <Link
                                href="/user"
                                className="flex items-center justify-center w-[244px] h-[64px] rounded-[12px] border border-[#e3e8ef] bg-white text-[20px] font-bold text-[#3a4456] transition-colors hover:bg-[#f7f9fb]"
                            >
                                구독 관리 (마이페이지)
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}