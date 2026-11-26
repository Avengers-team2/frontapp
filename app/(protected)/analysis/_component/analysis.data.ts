export type AnalysisFormValues = {
    areaCode: string;
    areaName: string;
    industryLarge: string;
    industryMid: string;
    industrySmall: string;
    depositMin: number;
    depositMax: number;
    monthlyRentMax: number | null;
    interiorBudgetMax: number | null;
    storeSize: string;
    operatingTimes: string[];
    targetAges: string[];
    targetGender: string;
    businessStatus: string;
    isFranchise: string;
    franchiseBrand: string;
    franchiseCategory: string;
    extraNote: string;
};

export const DEFAULT_VALUES: AnalysisFormValues = {
    areaCode: "",
    areaName: "",
    industryLarge: "",
    industryMid: "",
    industrySmall: "",
    depositMin: 0,
    depositMax: 0,
    monthlyRentMax: 0,
    interiorBudgetMax: 0,
    storeSize: "",
    operatingTimes: [],
    targetAges: [],
    targetGender: "",
    businessStatus: "",
    isFranchise: "",
    franchiseBrand: "",
    franchiseCategory: "",
    extraNote: "",
};

// 업종 상태 문구. 막지는 않고 선택할 수 있으며, 점수가 안 나오는 경우엔 참고 정보(정보판)를 보여준다
export const INDUSTRY_STATUS_TEXT = {
    analyzed: { short: "분석 가능", full: "점수 분석 가능" },
    noRecord: { short: "기록 없음", full: "이 상권엔 기록 없음 (참고 정보 제공)" },
    unsupported: { short: "점수 미지원", full: "점수 미지원 (참고 정보 제공)" },
} as const;

// 결과 화면의 "조건 수정"으로 돌아올 때 입력값을 되살리기 위한 sessionStorage 키
export const FORM_DRAFT_KEY = "analysis:form-draft"; // 마지막으로 제출한 입력값
export const FORM_RESTORE_KEY = "analysis:form-restore"; // 있으면 다음 입력 화면 진입 때 draft 를 채운다

export const SECTIONS = [
    { id: "area", label: "희망 지역", required: true },
    { id: "industry", label: "업종", required: true },
    { id: "budget", label: "창업 예산", required: true },
    { id: "size", label: "매장 규모", required: true },
    { id: "time", label: "운영 시간", required: true },
    { id: "target", label: "주요 타깃 고객층", required: true },
    { id: "status", label: "사업자 상태", required: true },
    { id: "franchise", label: "프랜차이즈 여부", required: true },
    { id: "note", label: "추가 의견", required: false },
] as const;

export const BUDGET_MAX = 30000;
export const NOTE_MAX = 500;

export const STORE_SIZES = [
    { value: "small", label: "소", desc: "20 ~ 40m²", box: "size-7" },
    { value: "medium", label: "중", desc: "40 ~ 66m²", box: "size-10" },
    { value: "large", label: "대", desc: "66m² 이상", box: "size-12" },
];

export const OPERATING_TIMES = ["아침 07~11시", "점심 11~15시", "오후 15~22시", "저녁 22~02시", "새벽 02~07시", "미정"];
export const TARGET_AGES = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];
export const TARGET_GENDERS = ["상관없음", "여성", "남성"];
export const BUSINESS_STATUSES = ["예비 창업자", "운영 중", "폐업 예정", "가게 이전", "미정"];
export const FRANCHISE_OPTIONS = ["예", "아니요", "미정"];

export const INDUSTRIES: Record<string, Record<string, string[]>> = {
    외식업: {
        한식: ["백반 · 한정식", "고기 · 구이", "국밥 · 탕", "분식"],
        중식: ["중식당"],
        일식: ["초밥 · 회", "라멘 · 돈카츠"],
        양식: ["파스타 · 스테이크", "브런치"],
        분식: ["김밥 · 떡볶이"],
        "카페 · 디저트": ["커피 전문점", "디저트 카페", "베이커리", "아이스크림 · 빙수", "차 · 음료 전문점"],
        주점: ["호프 · 맥주", "이자카야"],
        패스트푸드: ["버거", "피자", "치킨"],
    },
    도소매업: {
        "편의점 · 마트": ["편의점", "슈퍼마켓"],
        식료품: ["반찬가게", "청과상", "정육점", "수산물", "쌀 · 잡곡"],
        "의류 · 잡화": ["의류", "유아의류", "신발", "가방", "안경", "시계 · 귀금속"],
        "뷰티 · 건강": ["화장품", "미용재료", "약국", "의료기기"],
        "생활 · 취미": ["문구", "서점", "완구", "운동용품", "악기", "꽃집", "반려동물용품"],
        "가전 · 디지털": ["휴대폰", "컴퓨터 · 주변기기", "가전제품"],
        "가구 · 인테리어": ["가구", "인테리어", "조명", "철물점", "침구 · 섬유"],
        "자동차 · 운송": ["자동차부품", "자전거"],
    },
    서비스업: {
        미용: ["미용실", "네일숍", "피부관리"],
        세탁: ["세탁소", "코인빨래방"],
        교육: ["입시 · 보습학원", "외국어학원", "음악 · 미술학원", "컴퓨터학원", "스터디카페"],
        "운동 · 레저": ["헬스 · 필라테스", "스포츠 강습", "골프연습장", "당구장", "볼링장"],
        오락: ["PC방", "노래방", "오락실", "복권방"],
        의료: ["일반의원", "치과", "한의원", "동물병원"],
        "생활 서비스": ["사진관", "부동산중개", "가전 수리", "휴대폰 수리", "여행사"],
        자동차: ["자동차 정비", "세차 · 광택"],
        숙박: ["게스트하우스", "모텔", "고시원"],
    },
};
