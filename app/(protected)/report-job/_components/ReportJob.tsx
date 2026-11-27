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
import GridBeams from "./GridBeams";
import FileItem from "./FileItem";
import ReviewProgressModal from "./modals/ReviewProgressModal";
import LoginRequiredModal from "./modals/LoginRequiredModals";
import PremiumModal from "./modals/PremiumModal";
import LiquidSubmitButton from "@/app/(protected)/analysis/_component/LiquidSubmitButton";

type ModalType = null | "progress" | "login" | "premium";

// 페이지 축소(FIT)를 되돌려, 버튼이 상권분석 입력 화면과 같은 크기로 보이게 한다 (FIT 값의 역수)
const UNFIT =
    "min-[1680px]:max-[1919px]:[zoom:1.1429] " +
    "min-[1536px]:max-[1679px]:[zoom:1.25] " +
    "min-[1440px]:max-[1535px]:[zoom:1.3333] " +
    "min-[1280px]:max-[1439px]:[zoom:1.5] " +
    "max-[1279px]:[zoom:1.6667]";

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

    // 검토가 끝나 다른 화면으로 넘어갈 때 이 페이지 상태를 처음으로 되돌림
    // (next.config의 cacheComponents 때문에 다시 들어오면 이전 상태가 그대로 살아나서
    //  "AI 검토 중" 모달이 다시 뜨는 것을 막기 위함)
    const resetPage = () => {
        setModal(null);
        setPolling(false);
        setJob(null);
        setPendingFile(null);
        setUploadError(false);
        setStatus("PENDING");
    };

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
                // 이미 끝난 요청이면 진행 모달을 띄우지 않고 결과 화면으로
                if (resumed.status === "COMPLETED") {
                    router.replace(`/report-job/result?job=${resumed.id}`);
                    return;
                }
                if (resumed.status === "FAILED") {
                    router.replace(`/report-job/result?job=${resumed.id}&status=failed`);
                    return;
                }
                setJob(resumed);
                setStatus(resumed.status);
                setModal("progress");
                setPolling(true);
            })
            .catch((e) => alert(errorText(e, "검토 정보를 불러오지 못했어요.")));
    }, [resumeJobId, router]);

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

    const [sent, setSent] = useState(false); // 버튼에 "분석 요청 완료"를 잠깐 보여준다

    // 분석 취소 → 업로드 화면 처음 상태로
    const handleCancel = () => {
    if (!confirm("분석을 취소하고 다시 업로드할까요?")) return;

    setPolling(false);   // 상태 확인 멈춤
    setModal(null);      // 진행 모달 닫기
    setJob(null);        // 올린 파일 비우기
    setPendingFile(null);
    setUploadError(false);
    setStatus("PENDING");

    // 다시 검토하기로 들어온 경우 주소의 ?resume=번호 지우기
    if (resumeJobId !== null) router.replace("/report-job");
};

    // 분석 시작하기
    const handleStart = async () => {
        if (!job || uploading || uploadError || starting || sent) return;
        if (job.status !== "PENDING") return;
        if (!isLoggedIn) return setModal("login");
        if (!isPremium) return setModal("premium");

        setStarting(true);
        try {
            const started = await startReportJob(job.id);
            setStarting(false);
            setSent(true);
            await new Promise((resolve) => setTimeout(resolve, 400));
            setSent(false);
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
                    resetPage();
                    router.push(`/report-job/result?job=${id}`);
                }
                if (latest.status === "FAILED") {
                    clearInterval(timer);
                    resetPage();
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
    const noFile = !job || uploadError; // 파일을 올리기 전에는 시작 버튼을 회색으로 막는다

    return (
        // pt: 헤더 높이 (소개 페이지에서 맞춘 숫자와 동일하게)
        <div className="pt-[96px] overflow-x-hidden">
            <section className={FIT}>
                <div className="w-[1358px] mx-auto pt-[120px] pb-[175px]">
                    {/* 제목 뒤 격자 배경. 배경은 위아래로 넓게 퍼지고 아래 칸의 클릭은 막지 않는다 */}
                    <div className="relative isolate">
                        <GridBeams className="absolute -top-[150px] -bottom-[110px] left-0 -z-10 h-[calc(100%+260px)] w-full" />
                        <h1 className="text-center text-[48px] font-bold leading-[1.3] text-[#111]">
                            기획서 AI 분석
                        </h1>
                        <p className="mt-[19px] text-center text-[24px] leading-[1.3] text-[#666]">
                            사업계획서를 올리면 AI가 검토해 드려요
                        </p>
                    </div>

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

                    {/* 상권분석 입력 화면의 유리 버튼과 같은 디자인·모션. 화면에 붙어 따라오지 않고 제자리에 둔다 */}
                    <form
                        className={`mt-[30px] transition-[filter,opacity] duration-300 ${noFile ? "opacity-60 grayscale" : ""} ${UNFIT}`}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleStart();
                        }}
                    >
                        <LiquidSubmitButton
                            state={sent ? "ok" : starting ? "load" : "idle"}
                            disabled={noFile || uploading || starting || sent}
                            label="분석 시작하기 →"
                            doneLabel="분석 요청 완료"
                            expanded
                        />
                    </form>
                </div>
            </section>

            {modal === "progress" && job && (
                <ReviewProgressModal
                    fileName={job.fileName}
                    status={status}
                    onCancel={handleCancel}
                />
            )}
            {modal === "login" && <LoginRequiredModal onClose={() => setModal(null)} />}
            {modal === "premium" && <PremiumModal onClose={() => setModal(null)} />}
        </div>
    );
}