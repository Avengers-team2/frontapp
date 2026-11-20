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
