// ERD: support_bookmark
export interface SupportBookmark {
  bookmark_id: number;
  user_id: number;
  bookmark_program_id: string;
  bookmark_program_source: string;
  bookmark_notify_enabled: boolean;
  bookmark_deadline_date: string | null;
  bookmark_notified_at: string | null;
  bookmark_created_at: string;
}
