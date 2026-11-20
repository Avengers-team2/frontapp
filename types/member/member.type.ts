import { User } from "@/types/user";

// 로그인한 회원 정보 (ERD users 기준)
export type MemberDTO = User;

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
