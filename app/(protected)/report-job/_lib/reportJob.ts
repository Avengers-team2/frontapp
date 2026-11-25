// ─────────────────────────────────────────
// 연결 설정 (팀 설정에 맞춰 이 부분만 확인)
// ─────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const REPORT_PREFIX = "/reports"; // main.py의 include_router prefix와 같게

// 로그인 토큰 (쿠키 방식이면 비워 두기, 헤더 방식이면 팀 코드에 맞춰 넣기)
function authHeaders(): Record<string, string> {
    return {};
}

// ─────────────────────────────────────────
// 임시값 (팀 로그인 상태 · 구독 여부 연결 전까지)
// ─────────────────────────────────────────
export const MOCK = {
    loggedIn: true, // false → 로그인 필요 모달
    premium: true,  // false → Premium 안내 모달
};

// ─────────────────────────────────────────
// 업로드 가능한 파일 (백엔드 report_job_service와 동일하게)
// ─────────────────────────────────────────
export const ACCEPT = ".pdf,.docx";
const ALLOWED = ["pdf", "docx"];
export const MAX_SIZE_MB = 10;

export function getExt(name: string) {
    return name.split(".").pop()?.toLowerCase() ?? "";
}

// 문제가 있으면 안내 문구, 없으면 null
export function validateFile(file: File): string | null {
    if (!ALLOWED.includes(getExt(file.name))) {
        return "PDF, DOCX 파일만 올릴 수 있어요.";
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

// ─────────────────────────────────────────
// 백엔드 데이터 모양
// ─────────────────────────────────────────
// 백엔드 ReportStatus 와 동일
export type ReportJobStatus = "PENDING" | "FILE_CHECK" | "AI_REVIEW" | "SUMMARIZING" | "COMPLETED" | "FAILED";

export type ReportJob = {
    id: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    pageCount: number | null;
    status: ReportJobStatus;
    errorMessage: string | null;
};

// 응답을 화면에서 쓰기 좋은 모양으로 (camelCase · snake_case 둘 다 대응)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJob(d: any): ReportJob {
    return {
        id: d.reportJobId ?? d.report_job_id,
        fileName: d.reportJobFileName ?? d.report_job_file_name,
        fileType: d.reportJobFileType ?? d.report_job_file_type,
        fileSize: d.reportJobFileSize ?? d.report_job_file_size,
        pageCount: d.reportJobPageCount ?? d.report_job_page_count ?? null,
        status: String(d.reportJobStatus ?? d.report_job_status).toUpperCase() as ReportJobStatus,
        errorMessage: d.reportJobErrorMessage ?? d.report_job_error_message ?? null,
    };
}

// 서버가 돌려준 오류 (status: 401 로그인 필요, 400 잘못된 파일, 409 상태 충돌 등)
export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}${REPORT_PREFIX}${path}`, {
        ...init,
        credentials: "include",
        headers: { ...authHeaders(), ...(init.headers ?? {}) },
    });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
        const detail = typeof body?.detail === "string" ? body.detail : body?.message;
        throw new ApiError(res.status, detail ?? "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
    return body?.data as T;
}

// ─────────────────────────────────────────
// report_job API
// ─────────────────────────────────────────

// 1. 기획서 업로드 (PENDING)
export async function uploadReportFile(file: File): Promise<ReportJob> {
    const form = new FormData();
    form.append("file", file);
    return toJob(await request("/jobs", { method: "POST", body: form }));
}

// 2. 검토 시작 (PENDING → FILE_CHECK)
export async function startReportJob(id: number): Promise<ReportJob> {
    return toJob(await request(`/jobs/${id}/start`, { method: "POST" }));
}

// 3. 검토 상태 조회
export async function getReportJob(id: number): Promise<ReportJob> {
    return toJob(await request(`/jobs/${id}`));
}

// 4. 검토 요청 삭제 (PENDING · FAILED만)
export async function deleteReportJob(id: number): Promise<void> {
    await request(`/jobs/${id}`, { method: "DELETE" });
}

// 5. 다시 검토하기 (FAILED → FILE_CHECK)
export async function retryReportJob(id: number): Promise<ReportJob> {
    return toJob(await request(`/jobs/${id}/retry`, { method: "POST" }));
}