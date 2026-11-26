// 기획서 검토 — report_job, report_export
import { ApiResponseDTO } from "@/types/common/common.type";
import { PageResponse } from "@/types/post/post.type";
import { ReportJobItem } from "@/types/report";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reports`;

// 내 검토 요청 목록 — GET /reports/jobs
export const getMyReportJobsApi = async (page: number, size: number): Promise<ApiResponseDTO<PageResponse<ReportJobItem>>> => {
    const response = await fetch(`${BASE_URL}/jobs?page=${page}&size=${size}`, {
        credentials: "include"
    });

    if (!response.ok) throw new Error("getMyReportJobsApi fetching Error");
    const datas: ApiResponseDTO<PageResponse<ReportJobItem>> = await response.json();
    return datas;
};

// 검토 보고서 PDF 다운로드 링크 (백엔드 응답이 카멜 표기)
export interface ReportExportDownload {
    downloadUrl: string; // S3 임시 다운로드 주소 (열면 바로 내려받기)
    fileName: string;
    expiresIn: number;   // 링크 유효 시간(초)
}

// 검토 보고서 PDF 다운로드 링크 발급 — GET /reports/jobs/{report_job_id}/export (완료된 요청만)
export const getReportExportUrlApi = async (reportJobId: number): Promise<ApiResponseDTO<ReportExportDownload>> => {
    const response = await fetch(`${BASE_URL}/jobs/${reportJobId}/export`, {
        credentials: "include"
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail ?? "검토 보고서를 내려받지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
    const datas: ApiResponseDTO<ReportExportDownload> = await response.json();
    return datas;
};
