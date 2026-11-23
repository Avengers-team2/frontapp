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

export const SECTIONS = [
    { id: "area", label: "희망 지역", required: true },
    { id: "industry", label: "업종", required: true },
    { id: "budget", label: "창업 예산", required: true },
    { id: "size", label: "매장 규모", required: false },
    { id: "time", label: "운영 시간", required: false },
    { id: "target", label: "주요 타깃 고객층", required: false },
    { id: "status", label: "사업자 상태", required: true },
    { id: "franchise", label: "프랜차이즈 여부", required: false },
    { id: "note", label: "추가 의견", required: false },
] as const;

export const BUDGET_MAX = 5000;
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
        양식: ["파스타 · 스테이크", "버거"],
        분식: ["김밥 · 떡볶이"],
        "카페 · 디저트": ["커피 전문점", "디저트 카페", "베이커리", "아이스크림 · 빙수", "차 · 음료 전문점"],
        주점: ["호프 · 맥주", "이자카야"],
        패스트푸드: ["치킨", "피자"],
    },
    도소매업: {
        편의점: ["편의점"],
        "의류 · 잡화": ["의류", "신발 · 가방"],
    },
    서비스업: {
        미용: ["미용실", "네일숍", "피부관리"],
        세탁: ["세탁소", "코인빨래방"],
    },
};
