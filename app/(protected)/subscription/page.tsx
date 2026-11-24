import Link from "next/link";
import { FIT } from "./_lib/fit";
import { PLAN, formatWon } from "./_lib/plan";

export default function SubscriptionPage() {
    return (
        // pt: 헤더 높이 (다른 페이지와 동일)
        <div className="pt-[96px] overflow-x-hidden">
            <section className={FIT}>
                <div className="w-[840px] mx-auto pt-[126px] pb-[182px]">
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-[48px] font-bold text-[#111]">{PLAN.name}</h1>
                        <p className="mt-[12px] text-[19px] text-[#6b6b6b]">
                            기획서 AI 검토와 PDF 보고서는 Premium 구독으로 이용할 수 있어요.
                        </p>
                    </div>

                    {/* 요금제 카드 */}
                    <div
                        className="mt-[97px] p-[44px] rounded-[24px] border border-[#e6ebf1] bg-[#f7f9fb] transition-shadow duration-500 hover:shadow-[0_24px_60px_rgba(11,27,51,0.08)] animate-in fade-in slide-in-from-bottom-6 duration-700"
                        style={{ animationDelay: "150ms", animationFillMode: "both" }}
                    >
                        <p className="text-[26px] font-bold text-black">{PLAN.label}</p>
                        <p className="mt-[4px] text-[18px] text-black/75">{PLAN.desc}</p>

                        <p className="mt-[27px] flex items-baseline gap-[13px] pl-[8px]">
                            <span className="font-(family-name:--font-outfit) text-[56px] font-semibold text-black">
                                {formatWon(PLAN.price)}
                            </span>
                            <span className="text-[20px] font-medium text-black/60">/ 월</span>
                        </p>

                        <div className="mt-[26px] h-px bg-[#dfe3e8]" />

                        <ul className="mt-[30px] pl-[32px] flex flex-col gap-[15px]">
                            {PLAN.features.map((f) => (
                                <li
                                    key={f.text}
                                    className={`text-[19px] ${f.strong ? "font-medium text-black" : "text-black/75"}`}
                                >
                                    {f.text}
                                </li>
                            ))}
                        </ul>

                        <Link
                            href="/subscription/checkout"
                            className="group mt-[63px] flex items-center justify-center gap-[10px] h-[64px] rounded-full bg-linear-to-r from-[#13284a] via-[#1d5466] via-55% to-[#2bb3a3] text-[20px] font-bold text-white transition-all duration-300 hover:brightness-110 active:scale-[0.99]"
                        >
                            Premium 구독하기
                            <span className="transition-transform duration-300 group-hover:translate-x-[4px]">→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}