"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FIT } from "../../_lib/fit";
import { PLAN, METHODS, formatWon, getMethodLabel, requestSubscription, type MethodId } from "../../_lib/plan";

const AGREEMENTS = [
    { id: "billing", label: "(필수) 정기결제 · 자동 갱신에 동의해요" },
    { id: "terms", label: "(필수) 결제 서비스 이용약관에 동의해요" },
];

// 체크박스 모양
function CheckBox({ checked }: { checked: boolean }) {
    return (
        <span
            className={`shrink-0 flex items-center justify-center w-[26px] h-[26px] rounded-[7px] text-[16px] font-bold text-white transition-colors duration-200 ${
                checked ? "bg-[#13284a]" : "bg-white border-[1.5px] border-[#c9d1dc]"
            }`}
        >
            {checked && "✓"}
        </span>
    );
}

export default function Checkout() {
    const router = useRouter();
    const [method, setMethod] = useState<MethodId>("card");
    const [agreed, setAgreed] = useState<Record<string, boolean>>({ billing: false, terms: false });
    const [paying, setPaying] = useState(false);

    const allAgreed = AGREEMENTS.every((a) => agreed[a.id]);

    const toggleAll = () => {
        const next = !allAgreed;
        setAgreed(Object.fromEntries(AGREEMENTS.map((a) => [a.id, next])));
    };

    const toggleOne = (id: string) => setAgreed((prev) => ({ ...prev, [id]: !prev[id] }));

    const handlePay = async () => {
        if (!allAgreed || paying) return;
        setPaying(true);
        try {
            const res = await requestSubscription(method);
            router.push(`/subscription/complete?method=${method}&next=${res.nextBillingDate}`);
        } catch {
            alert("결제에 실패했어요. 다시 시도해 주세요.");
            setPaying(false);
        }
    };

    return (
        // pt: 헤더 높이 (다른 페이지와 동일)
        <div className="pt-[96px] overflow-x-hidden">
            <section className={FIT}>
                <div className="w-[1440px] mx-auto pt-[126px] pb-[114px]">
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-[48px] font-bold text-[#111]">결제하기</h1>
                        <p className="mt-[12px] text-[19px] text-[#6b6b6b]">
                            Premium 구독을 시작하기 전에 결제 정보를 확인해 주세요.
                        </p>
                    </div>

                    <div className="mt-[97px] flex items-start gap-[72px]">
                        {/* 왼쪽: 결제 폼 */}
                        <div className="w-[816px] shrink-0">
                            {/* 01 결제 수단 */}
                            <h2 className="flex items-baseline gap-[14px]">
                                <span className="font-(family-name:--font-outfit) text-[30px] font-semibold text-[#2bb3a3]">01</span>
                                <span className="text-[34px] font-bold text-[#111]">결제 수단</span>
                            </h2>

                            <div className="mt-[30px] grid grid-cols-2 gap-x-[24px] gap-y-[16px]">
                                {METHODS.map((m) => {
                                    const selected = method === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setMethod(m.id)}
                                            className={`flex items-center gap-[16px] h-[72px] px-[24px] rounded-[14px] text-left text-[20px] cursor-pointer transition-all duration-200 ${
                                                selected
                                                    ? "bg-[#f2fbf9] border-2 border-[#13284a] font-bold text-[#111]"
                                                    : "bg-white border border-[#e3e8ef] text-[#3a4456] hover:border-[#9aa7b8]"
                                            }`}
                                        >
                                            {/* 라디오 */}
                                            <span
                                                className={`shrink-0 flex items-center justify-center w-[22px] h-[22px] rounded-full border-2 transition-colors ${
                                                    selected ? "border-[#13284a]" : "border-[#c9d1dc]"
                                                }`}
                                            >
                                                {selected && <span className="w-[10px] h-[10px] rounded-full bg-[#13284a]" />}
                                            </span>
                                            {m.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-[90px] h-px bg-[#e3e3e3]" />

                            {/* 02 결제 동의 */}
                            <h2 className="mt-[49px] flex items-baseline gap-[14px]">
                                <span className="font-(family-name:--font-outfit) text-[30px] font-semibold text-[#2bb3a3]">02</span>
                                <span className="text-[34px] font-bold text-[#111]">결제 동의</span>
                            </h2>

                            <button
                                type="button"
                                onClick={toggleAll}
                                className="mt-[30px] flex items-center gap-[14px] text-[19px] font-bold text-[#2b2b2b] cursor-pointer"
                            >
                                <CheckBox checked={allAgreed} />
                                전체 동의
                            </button>

                            <div className="mt-[18px] h-px bg-[#e6ebf1]" />

                            <ul className="mt-[23px] flex flex-col gap-[17px]">
                                {AGREEMENTS.map((a) => (
                                    <li key={a.id}>
                                        <button
                                            type="button"
                                            onClick={() => toggleOne(a.id)}
                                            className="flex items-center gap-[14px] text-[19px] text-[#2b2b2b] cursor-pointer"
                                        >
                                            <CheckBox checked={!!agreed[a.id]} />
                                            {a.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 오른쪽: 주문 요약 */}
                        <aside className="flex-1 p-[36px] rounded-[20px] border border-[#e6ebf1] bg-[#f7f9fb]">
                            <h3 className="text-[26px] font-bold text-[#111]">주문 요약</h3>

                            <dl className="mt-[25px] flex flex-col gap-[17px] text-[18px]">
                                {[
                                    ["상품", PLAN.name],
                                    ["이용 기간", "월 구독 · 자동 갱신"],
                                    ["결제 수단", getMethodLabel(method)],
                                ].map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <dt className="text-[#5b6577]">{key}</dt>
                                        <dd className="font-semibold text-[#111]">{value}</dd>
                                    </div>
                                ))}
                            </dl>

                            <div className="mt-[31px] h-px bg-[#e3e8ef]" />

                            <div className="mt-[22px] flex items-center justify-between">
                                <span className="text-[20px] font-bold text-[#111]">결제 금액</span>
                                <span className="font-(family-name:--font-outfit) text-[36px] font-semibold text-[#13284a]">
                                    {formatWon(PLAN.price)}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handlePay}
                                disabled={!allAgreed || paying}
                                className={`mt-[53px] w-full h-[64px] rounded-full text-[20px] font-bold text-white transition-all duration-300 ${
                                    allAgreed && !paying
                                        ? "bg-linear-to-r from-[#13284a] via-[#1d5466] via-55% to-[#2bb3a3] cursor-pointer hover:brightness-110 active:scale-[0.99]"
                                        : "bg-[#ddd] cursor-not-allowed"
                                }`}
                            >
                                {paying ? "결제 중..." : "결제하기"}
                            </button>
                            {!allAgreed && (
                                <p className="mt-[12px] text-center text-[15px] text-[#8a95a8]">필수 약관에 동의하면 결제할 수 있어요.</p>
                            )}
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    );
}