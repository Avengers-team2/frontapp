// ERD: report_job, report_export
export interface ReportJob {
  report_job_id: number;
  user_id: number;
  report_job_file_name: string;
  report_job_file_type: string;
  report_job_file_size: number;
  report_job_file_path: string;
  report_job_status: string;
  report_job_error_message: string | null;
  report_job_created_at: string;
  report_job_completed_at: string | null;
}

export interface ReportExport {
  export_id: number;
  report_job_id: number;
  export_file_path: string;
  export_created_at: string;
}

// 검토 진행 상태 (백엔드 ReportStatus와 같은 값)
export type ReportJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "FILE_CHECK"
  | "AI_REVIEW"
  | "SUMMARIZING"
  | "COMPLETED"
  | "FAILED";

// 검토 요청 응답 (GET /reports/jobs 목록 한 줄)
// 백엔드 ReportJobResponseDTO가 camelCase 별칭으로 내려와서 키가 camelCase
export interface ReportJobItem {
  reportJobId: number;
  reportJobFileName: string;
  reportJobFileType: string;
  reportJobFileSize: number;
  reportJobPageCount: number | null;
  reportJobStatus: ReportJobStatus;
  reportJobErrorMessage: string | null;
  reportJobCreatedAt: string | null;
  reportJobCompletedAt: string | null;
}
