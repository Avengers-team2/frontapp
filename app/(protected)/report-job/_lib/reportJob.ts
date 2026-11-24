// ─────────────────────────────────────────
// 테스트용 스위치 (화면 확인할 때 바꿔 보세요)
// ─────────────────────────────────────────
export const MOCK = {
    loggedIn: true,    // false → 로그인 필요 모달
    premium: true,     // false → Premium 안내 모달
    uploadFail: false, // true  → 오류 화면
};

// 업로드 가능한 파일
export const ACCEPT = ".pdf,.doc,.docx,.hwp,.hwpx";
const ALLOWED = ["pdf", "doc", "docx", "hwp", "hwpx"];
export const MAX_SIZE_MB = 20;

export function getExt(name: string) {
    return name.split(".").pop()?.toLowerCase() ?? "";
}

// 문제가 있으면 안내 문구, 없으면 null
export function validateFile(file: File): string | null {
    if (!ALLOWED.includes(getExt(file.name))) {
        return "docs, pdf, hwp 등 문서 파일만 올릴 수 있어요.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return `파일 용량은 ${MAX_SIZE_MB}MB까지 올릴 수 있어요.`;
    }
    return null;
}

export function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

// report_job.status 값 (백엔드 컬럼 값이 정해지면 맞춰 주세요)
export type ReportJobStatus =
    | "queued"       // 접수됨 (파일 확인 중)
    | "file_checked" // 파일 확인 완료
    | "reviewing"    // AI 검토 중
    | "summarizing"  // 결과 정리 중
    | "done"         // 완료
    | "failed";      // 실패

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────
// 아래 두 함수만 실제 API로 바꾸면 백엔드 연결 끝
// ─────────────────────────────────────────

// 기획서 업로드 → report_job 생성
export async function createReportJob(file: File): Promise<{ jobId: number }> {
    // TODO: 백엔드 연결 시 교체
    // const form = new FormData();
    // form.append("file", file);
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report-jobs`, {
    //     method: "POST", body: form, credentials: "include",
    // });
    // if (!res.ok) throw new Error("upload failed");
    // return res.json();

    await wait(800);
    if (MOCK.uploadFail) throw new Error("upload failed");
    return { jobId: Date.now() };
}

// report_job 상태 확인
const MOCK_FLOW: ReportJobStatus[] = ["queued", "file_checked", "reviewing", "reviewing", "summarizing", "done"];
const mockStep = new Map<number, number>();

export async function getReportJobStatus(jobId: number): Promise<ReportJobStatus> {
    // TODO: 백엔드 연결 시 교체
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report-jobs/${jobId}`, { credentials: "include" });
    // const data = await res.json();
    // return data.status;

    await wait(300);
    const step = mockStep.get(jobId) ?? 0;
    mockStep.set(jobId, step + 1);
    return MOCK_FLOW[Math.min(step, MOCK_FLOW.length - 1)];
}