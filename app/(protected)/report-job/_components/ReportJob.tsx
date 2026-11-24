"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FIT } from "../_lib/fit";
import { MOCK, validateFile, createReportJob, getReportJobStatus, type ReportJobStatus } from "../_lib/reportJob";
import FileDropBox from "./FileDropBox";
import FileItem from "./FileItem";
import ReviewProgressModal from "./modals/ReviewProgressModal";
import LoginRequiredModal from "./modals/LoginRequiredModals";
import PremiumModal from "./modals/PremiumModal";

type ModalType = null | "progress" | "login" | "premium";

export default function ReportJob() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState<ModalType>(null);
    const [jobId, setJobId] = useState<number | null>(null);
    const [status, setStatus] = useState<ReportJobStatus>("queued");

    // 파일 선택 / 드롭
    const handleFile = (next: File) => {
        const message = validateFile(next);
        if (message) {
            alert(message);
            return;
        }
        setFile(next);
        setUploadError(false);
    };

    const handleRemove = () => {
        setFile(null);
        setUploadError(false);
    };

    // 분석 시작하기
    const handleStart = async () => {
        if (!file || uploadError || submitting) return;
        if (!MOCK.loggedIn) return setModal("login");   // TODO: 팀 로그인 상태로 교체
        if (!MOCK.premium) return setModal("premium");  // TODO: 구독 여부로 교체

        setSubmitting(true);
        try {
            const res = await createReportJob(file);
            setStatus("queued");
            setJobId(res.jobId);
            setModal("progress");
        } catch {
            setUploadError(true);
        } finally {
            setSubmitting(false);
        }
    };

    // 검토 진행 상태 확인 (1.5초마다)
    useEffect(() => {
        if (jobId === null) return;
        let stopped = false;

        const timer = setInterval(async () => {
            try {
                const next = await getReportJobStatus(jobId);
                if (stopped) return;
                setStatus(next);

                if (next === "done") {
                    clearInterval(timer);
                    router.push(`/report-job/result?job=${jobId}`);
                }
                if (next === "failed") {
                    clearInterval(timer);
                    setModal(null);
                    setJobId(null);
                    setUploadError(true);
                }
            } catch {
                // 일시적인 네트워크 오류는 다음 확인 때 다시 시도
            }
        }, 1500);

        return () => {
            stopped = true;
            clearInterval(timer);
        };
    }, [jobId, router]);

    const canStart = !!file && !uploadError && !submitting;

    return (
        // pt: 헤더 높이 (소개 페이지에서 맞춘 숫자와 동일하게)
        <div className="pt-[96px] overflow-x-hidden">
            <section className={FIT}>
                <div className="w-[1358px] mx-auto pt-[120px] pb-[175px]">
                    <h1 className="text-center text-[48px] font-bold leading-[1.3] text-[#111]">
                        기획서 AI 분석
                    </h1>
                    <p className="mt-[19px] text-center text-[24px] leading-[1.3] text-[#666]">
                        사업계획서를 올리면 AI가 검토해 드려요
                    </p>

                    <div className="mt-[129px]">
                        <FileDropBox error={uploadError} onFile={handleFile} />
                    </div>

                    {file && (
                        <div className="mt-[25px]">
                            <FileItem file={file} error={uploadError} onRemove={handleRemove} />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleStart}
                        disabled={!canStart}
                        className={`mt-[30px] w-full h-[88px] rounded-full text-[24px] font-bold text-white transition-all duration-300 ${
                            canStart
                                ? "bg-linear-to-r from-[#13284a] via-[#1d5466] via-55% to-[#2bb3a3] cursor-pointer hover:brightness-110 active:scale-[0.99]"
                                : "bg-[#ddd] cursor-not-allowed"
                        }`}
                    >
                        {submitting ? "업로드 중..." : "분석 시작하기"}
                    </button>
                </div>
            </section>

            {modal === "progress" && file && (
                <ReviewProgressModal
                    fileName={file.name}
                    status={status}
                    onLater={() => router.push("/user")}
                />
            )}
            {modal === "login" && <LoginRequiredModal onClose={() => setModal(null)} />}
            {modal === "premium" && <PremiumModal onClose={() => setModal(null)} />}
        </div>
    );
}