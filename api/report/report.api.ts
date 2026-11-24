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
