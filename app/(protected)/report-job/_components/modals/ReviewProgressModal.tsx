import ModalShell from "./ModalShell";
import type { ReportJobStatus } from "../../_lib/reportJob";

type Props = {
    fileName: string;
    status: ReportJobStatus;
    onLater: () => void;
};

// 상태 → 지금 진행 중인 단계 번호
const CURRENT: Record<ReportJobStatus, number> = {
    queued: 0,
    file_checked: 1,
    reviewing: 1,
    summarizing: 2,
    done: 3,
    failed: 0,
};

export default function ReviewProgressModal({ fileName, status, onLater }: Props) {
    const current = CURRENT[status];

    const steps = [
        {
            title: "파일 확인",
            wait: "",
            active: "파일 형식과 내용을 확인하고 있어요.",
            done: `${fileName}를 확인했어요.`,
            doneLabel: "확인됨",
        },
        {
            title: "AI 검토",
            wait: "파일 확인이 끝나면 시작해요.",
            active: "기획서 내용을 상권 데이터와 대조하고 있어요.",
            done: "AI 검토를 마쳤어요.",
            doneLabel: "완료",
        },
        {
            title: "검토 결과 정리",
            wait: "검토가 끝나면 결과를 보여드려요.",
            active: "검토 결과를 정리하고 있어요.",
            done: "정리가 끝났어요.",
            doneLabel: "완료",
        },
    ];

    return (
        <ModalShell>
            <div className="w-[912px] p-[48px] rounded-[24px] bg-white shadow-[0_30px_80px_rgba(7,16,31,0.3)]">
                {/* 상단 */}
                <div className="flex items-center gap-[29px]">
                    <div className="shrink-0 flex items-center justify-center w-[77px] h-[77px] rounded-[20px] bg-[#eaf8f6]">
                        <svg className="w-[36px] h-[36px] animate-spin" viewBox="0 0 36 36" fill="none">
                            <circle cx="18" cy="18" r="14" stroke="#0b7468" strokeOpacity="0.15" strokeWidth="3.5" />
                            <path d="M32 18a14 14 0 0 0-14-14" stroke="#0b7468" strokeWidth="3.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[34px] font-bold leading-[1.5] text-[#111]">AI 검토 중이에요</p>
                        <p className="text-[20px] leading-[1.5] text-[#6b6b6b]">완료되면 검토 결과 화면으로 넘어가요.</p>
                    </div>
                </div>

                <div className="mt-[34px] h-[1.2px] bg-[#e6ebf1]" />

                <p className="mt-[28px] text-[18px] font-semibold leading-[1.5] text-[#6b6b6b]">검토 진행 단계</p>

                {/* 단계 목록 */}
                <ul className="mt-[14px]">
                    {steps.map((step, i) => {
                        const state = i < current ? "done" : i === current ? "active" : "wait";

                        return (
                            <li
                                key={step.title}
                                className={`flex items-center h-[110px] px-[24px] rounded-[14px] transition-colors duration-500 ${
                                    state === "active" ? "bg-[#eaf8f6]" : "border-t-[1.2px] border-[#e3e3e3]"
                                }`}
                            >
                                {/* 동그라미 */}
                                <span
                                    className={`shrink-0 flex items-center justify-center w-[44px] h-[44px] rounded-full text-[19px] font-bold transition-colors duration-500 ${
                                        state === "done"
                                            ? "bg-[#111] text-white"
                                            : state === "active"
                                                ? "border-2 border-[#0b7468] text-[#0b7468]"
                                                : "bg-[#f1f3f5] text-[#0b7468]"
                                    }`}
                                >
                                    {state === "done" ? "✓" : state === "active" ? <span className="animate-pulse">…</span> : i + 1}
                                </span>

                                {/* 내용 */}
                                <div className="ml-[24px]">
                                    <p className="text-[22px] font-semibold leading-[1.5] text-[#111]">{step.title}</p>
                                    <p className="mt-[3px] text-[18px] leading-[1.5] text-[#6b6b6b]">{step[state] || step.active}</p>
                                </div>

                                {/* 상태 */}
                                <span
                                    className={`ml-auto text-[18px] font-semibold ${
                                        state === "active" ? "text-[#0b7468]" : "text-[#6b6b6b]"
                                    }`}
                                >
                                    {state === "done" ? step.doneLabel : state === "active" ? "진행 중" : "대기"}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                {/* 나중에 확인 */}
                <button
                    type="button"
                    onClick={onLater}
                    className="mt-[34px] w-[324px] h-[67px] rounded-[12px] border border-[#e3e8ef] bg-white shadow-[0_4px_14px_rgba(11,27,51,0.05)] text-[19px] font-semibold text-[#3a4456] cursor-pointer transition-colors hover:bg-[#f7f9fc]"
                >
                    ← 나중에 확인하기 · 마이페이지로
                </button>
            </div>
        </ModalShell>
    );
}