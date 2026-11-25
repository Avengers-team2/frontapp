// ERD: users
export interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  user_sex: string;
  user_nickname: string;
  user_profile_image?: string | null; // 프로필 사진 URL (백엔드 필드명 확정 전, 없으면 닉네임 첫 글자 표시)
  user_birth: string;
  user_phone: string;
  user_provider: string | null;
  user_provider_id: string | null;
  user_status: string;
  user_business_status: string;
  user_interest_region: string | null;   // 관심 지역
  user_interest_industry: string | null; // 관심 업종
  user_created_at: string;
  user_updated_at: string | null;
  user_deleted_at: string | null;
}

// 소셜 로그인 후 추가 정보 입력
export interface JoinAdditionalRequestDTO {
  user_nickname: string;
  user_sex: string;
  user_birth: string;
  user_phone: string;
  user_business_status: string;
}

// 프로필 이미지 변경
export interface ProfileUpdateRequestDTO {
  id: number;
  file: File;
}
