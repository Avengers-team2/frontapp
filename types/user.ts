// ERD: users
export interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_sex: string;
  user_nickname: string;
  user_birth: string;
  user_phone: string;
  user_provider: string | null;
  user_provider_id: string | null;
  user_status: string;
  user_business_status: string;
  user_created_at: string;
  user_updated_at: string | null;
  user_deleted_at: string | null;
}
