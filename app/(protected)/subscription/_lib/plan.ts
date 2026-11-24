// ─────────────────────────────────────────
// 테스트용 스위치
// ─────────────────────────────────────────
export const MOCK_PAY = {
    fail: false, // true → 결제 실패 alert
};

export const PLAN = {
    name: "StartFit Premium",
    label: "Premium",
    desc: "기획서를 AI로 검토하고 보고서로 받아보세요.",
    price: 4990,
    features: [
        { text: "무료 기능 전체", strong: false },
        { text: "기획서 AI 검토 · 6개 항목 채점", strong: true },
        { text: "항목별 근거와 보완점 제안", strong: true },
        { text: "검토 보고서 PDF 내려받기", strong: true },
        { text: "검토 이력 보관 · 다시 내려받기", strong: true },
    ],
};

export const METHODS = [
    { id: "card", label: "신용 · 체크카드" },
    { id: "kakaopay", label: "카카오페이" },
    { id: "naverpay", label: "네이버페이" },
    { id: "tosspay", label: "토스페이" },
] as const;

export type MethodId = (typeof METHODS)[number]["id"];

export const formatWon = (n: number) => `₩ ${n.toLocaleString("ko-KR")}`;

export const getMethodLabel = (id?: string) =>
    METHODS.find((m) => m.id === id)?.label ?? METHODS[0].label;

const toDateText = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;

// 구독 결제 요청
export async function requestSubscription(method: MethodId): Promise<{ nextBillingDate: string }> {
    // TODO: 실제 결제(PG) 연동은 백엔드와 함께 진행
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (MOCK_PAY.fail) throw new Error("payment failed");

    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return { nextBillingDate: toDateText(next) };
}