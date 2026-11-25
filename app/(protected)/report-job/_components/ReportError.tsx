"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { retryReportJob } from "../_lib/reportJob";

const REASONS = [
    "AI 서비스 응답이 늦거나 일시적으로 연결되지 않을 때",
    "검토 중 네트워크 연결이 끊겼을 때",
];

type Props = {
    jobId?: number | null;
};

export default function ReportError({ jobId }: Props) {
    const router = useRouter();
    const [retrying, setRetrying] = useState(false);

    const handleRetry = async () => {
        if (!jobId) {
            router.push("/report-job");
            return;
        }
        setRetrying(true);
        try {
            await retryReportJob(jobId);
            router.push(`/report-job?resume=${jobId}`); // 진행 모달로 이어서
        } catch (e) {
            alert(e instanceof Error ? e.message : "다시 검토를 시작하지 못했어요.");
            router.push("/report-job");
        }
    };

    return (
        <div className="w-[720px] mx-auto pt-[191px] pb-[200px] text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-[45px] font-bold leading-[1.4] text-[#111]">AI 응답을 받지 못했어요</h1>
            <p className="mt-[20px] text-[19px] leading-[1.5] text-[#2b2b2b]">
                알수없는 오류가 발생했습니다. 다시 시도해주세요
            </p>

            <div className="mt-[42px] p-[32px] rounded-[16px] bg-[#f7f9fb] text-left">
                <p className="text-[20px] font-semibold leading-[1.5] text-[#111]">이럴 때 생길 수 있어요</p>
                <ul className="mt-[7px] flex flex-col gap-[11px]">
                    {REASONS.map((reason) => (
                        <li key={reason} className="flex gap-[14px] text-[19px] leading-[1.5]">
                            <span className="font-semibold text-[#0b7468]">—</span>
                            <span className="text-[#2b2b2b]">{reason}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                className="mt-[40px] inline-flex items-center justify-center w-[166px] h-[62px] rounded-full bg-[#13284a] text-[19px] font-bold text-white cursor-pointer transition-colors hover:bg-[#1d3a66] disabled:opacity-60 disabled:cursor-wait"
            >
                {retrying ? "요청 중..." : "다시 검토하기"}
            </button>
        </div>
    );
}