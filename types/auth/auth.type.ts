// 로그인 요청
export interface LoginRequestDTO {
    user_email: string;
    user_password: string;
}

// 회원가입 요청
export interface SignUpRequestDTO {
    user_email: string;
    user_password?: string;      // 소셜 가입 시 생략
    user_provider?: string;      // 소셜 가입 시에만 (kakao / naver / google)
    user_provider_id?: string;   // 소셜 가입 시에만
    user_nickname: string;
    user_sex: "male" | "female";
    user_birth: string;          // YYYY-MM-DD
    user_phone: string;          // 010-1234-5678
    user_business_status: string; // 예비 창업자 / 운영 중 / 폐업 예정 / 가게 이전 / 미정
    agree_terms: boolean;        // 서비스 이용약관 (필수)
    agree_privacy: boolean;      // 개인정보 수집·이용 (필수)
    agree_marketing: boolean;    // 지원사업 마감 알림 (선택)
}
