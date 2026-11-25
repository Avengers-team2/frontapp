"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FIT } from "../_lib/fit";
import {
    MOCK,
    ApiError,
    validateFile,
    uploadReportFile,
    startReportJob,
    getReportJob,
    deleteReportJob,
    type ReportJob as Job,
    type ReportJobStatus,
} from "../_lib/reportJob";
import FileDropBox from "./FileDropBox";
import FileItem from "./FileItem";
import ReviewProgressModal from "./modals/ReviewProgressModal";
import LoginRequiredModal from "./modals/LoginRequiredModals";
import PremiumModal from "./modals/PremiumModal";

type ModalType = null | "progress" | "login" | "premium";

type Props = {
    resumeJobId: number | null; // 다시 검토하기로 돌아온 경우
};

const errorText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

export default function ReportJob({ resumeJobId }: Props) {
    const router = useRouter();

    // TODO: 팀 로그인 상태 · 구독 여부로 교체 (지금은 _lib/reportJob.ts의 MOCK 값)
    const isLoggedIn = MOCK.loggedIn;
    const isPremium = MOCK.premium;

    const [job, setJob] = useState<Job | null>(null);                                       // 서버에 올라간 요청
    const [pendingFile, setPendingFile] = useState<{ name: string; size: number } | null>(null); // 업로드 중 표시용
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(false);
    const [starting, setStarting] = useState(false);
    const [modal, setModal] = useState<ModalType>(null);
    const [polling, setPolling] = useState(false);
    const [status, setStatus] = useState<ReportJobStatus>("PENDING");

    // 로그인이 풀린 경우(401)는 로그인 모달로
    const isAuthError = (e: unknown) => {
        if (e instanceof ApiError && e.status === 401) {
            setModal("login");
            return true;
        }
        return false;
    };

    // 다시 검토하기로 돌아온 경우: 진행 모달부터 이어서 보여줌
    useEffect(() => {
        if (resumeJobId === null) return;
        getReportJob(resumeJobId)
            .then((resumed) => {
                setJob(resumed);
                setStatus(resumed.status);
                setModal("progress");
                setPolling(true);
            })
            .catch((e) => alert(errorText(e, "검토 정보를 불러오지 못했어요.")));
    }, [resumeJobId]);

    // 파일 선택 / 드롭 → 바로 업로드
    const handleFile = async (next: File) => {
        if (!isLoggedIn) {
            setModal("login");
            return;
        }
        const message = validateFile(next);
        if (message) {
            alert(message);
            return;
        }

        // 이미 올린 파일이 있으면 서버에서도 지우고 교체
        if (job) deleteReportJob(job.id).catch(() => {});

        setJob(null);
        setUploadError(false);
        setPendingFile({ name: next.name, size: next.size });
        setUploading(true);

        try {
            setJob(await uploadReportFile(next));
        } catch (e) {
            if (isAuthError(e)) {
                setPendingFile(null);
            } else if (e instanceof ApiError && e.status === 400) {
                alert(e.message); // 형식 · 용량 · 빈 파일 안내
                setPendingFile(null);
            } else {
                setUploadError(true); // 전송 실패 → 빨간 오류 화면
            }
        } finally {
            setUploading(false);
        }
    };

    // 삭제
    const handleRemove = async () => {
        if (job) {
            try {
                await deleteReportJob(job.id);
            } catch (e) {
                if (!isAuthError(e)) alert(errorText(e, "삭제하지 못했어요."));
                return;
            }
        }
        setJob(null);
        setPendingFile(null);
        setUploadError(false);
    };

    // 분석 시작하기
    const handleStart = async () => {
        if (!job || uploading || uploadError || starting) return;
        if (!isLoggedIn) return setModal("login");
        if (!isPremium) return setModal("premium");

        setStarting(true);
        try {
            const started = await startReportJob(job.id);
            setStatus(started.status);
            setModal("progress");
            setPolling(true);
        } catch (e) {
            if (!isAuthError(e)) alert(errorText(e, "검토를 시작하지 못했어요."));
        } finally {
            setStarting(false);
        }
    };

    // 검토 진행 상태 확인 (2초마다)
    useEffect(() => {
        if (!polling || !job) return;
        const id = job.id;
        let stopped = false;

        const timer = setInterval(async () => {
            try {
                const latest = await getReportJob(id);
                if (stopped) return;
                setStatus(latest.status);

                if (latest.status === "COMPLETED") {
                    clearInterval(timer);
                    router.push(`/report-job/result?job=${id}`);
                }
                if (latest.status === "FAILED") {
                    clearInterval(timer);
                    router.push(`/report-job/result?job=${id}&status=failed`);
                }
            } catch {
                // 일시적인 네트워크 오류는 다음 확인 때 다시 시도
            }
        }, 2000);

        return () => {
            stopped = true;
            clearInterval(timer);
        };
    }, [polling, job, router]);

    const shownFile = job
        ? { name: job.fileName, size: job.fileSize, pageCount: job.pageCount }
        : pendingFile
            ? { name: pendingFile.name, size: pendingFile.size, pageCount: null }
            : null;
    const fileState = uploadError ? "error" : uploading ? "uploading" : "done";
    const canStart = !!job && job.status === "PENDING" && !uploading && !uploadError && !starting;

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
                        <FileDropBox
                            error={uploadError}
                            canUpload={isLoggedIn}
                            onBlocked={() => setModal("login")}
                            onFile={handleFile}
                        />
                    </div>

                    {shownFile && (
                        <div className="mt-[25px]">
                            <FileItem
                                fileName={shownFile.name}
                                fileSize={shownFile.size}
                                pageCount={shownFile.pageCount}
                                state={fileState}
                                onRemove={handleRemove}
                            />
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
                        {starting ? "검토 시작 중..." : "분석 시작하기"}
                    </button>
                </div>
            </section>

            {modal === "progress" && job && (
                <ReviewProgressModal
                    fileName={job.fileName}
                    status={status}
                    onLater={() => router.push("/user")}
                />
            )}
            {modal === "login" && <LoginRequiredModal onClose={() => setModal(null)} />}
            {modal === "premium" && <PremiumModal onClose={() => setModal(null)} />}
        </div>
    );
}