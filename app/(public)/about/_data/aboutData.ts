// [Hero] 점수 카드에서 돌아가며 보여줄 지역 (예시 데이터)
const GOOD = "#5ef0dc";   // 좋음
const MID = "#ffb547";    // 보통
const BAD = "#ff8a6b";    // 주의

// [Hero] 수치가 변동하는 하단바
export const heroSpots = [
    {
        spot: "강남 신사동 가로수길",
        score: 73,
        verdict: "검토 필요",
        items: [
            { label: "폐업 위험", status: "보통", value: 55, color: MID },
            { label: "임대료", status: "상승 중", value: 70, color: BAD },
            { label: "경쟁", status: "치열", value: 80, color: BAD },
            { label: "지원사업", status: "3건 가능", value: 60, color: GOOD },
        ],
        stats: [
            { label: "유동인구", value: 39700, unit: "명/일" },
            { label: "동종 점포", value: 41, unit: "곳" },
            { label: "1년 폐업", value: 12, unit: "곳" },
            { label: "임대료 추이", value: 6.8, unit: "%", decimals: 1, signed: true },
            { label: "지원사업", value: 3, unit: "건" },
        ],
    },
    {
        spot: "마포 연남동 동진시장",
        score: 81,
        verdict: "추천",
        items: [
            { label: "폐업 위험", status: "낮음", value: 30, color: GOOD },
            { label: "임대료", status: "보통", value: 50, color: MID },
            { label: "경쟁", status: "보통", value: 55, color: MID },
            { label: "지원사업", status: "5건 가능", value: 85, color: GOOD },
        ],
        stats: [
            { label: "유동인구", value: 52300, unit: "명/일" },
            { label: "동종 점포", value: 28, unit: "곳" },
            { label: "1년 폐업", value: 6, unit: "곳" },
            { label: "임대료 추이", value: 3.2, unit: "%", decimals: 1, signed: true },
            { label: "지원사업", value: 5, unit: "건" },
        ],
    },
    {
        spot: "성동 성수동 연무장길",
        score: 64,
        verdict: "주의",
        items: [
            { label: "폐업 위험", status: "높음", value: 78, color: BAD },
            { label: "임대료", status: "급상승", value: 90, color: BAD },
            { label: "경쟁", status: "치열", value: 85, color: BAD },
            { label: "지원사업", status: "2건 가능", value: 40, color: GOOD },
        ],
        stats: [
            { label: "유동인구", value: 61800, unit: "명/일" },
            { label: "동종 점포", value: 57, unit: "곳" },
            { label: "1년 폐업", value: 19, unit: "곳" },
            { label: "임대료 추이", value: 11.4, unit: "%", decimals: 1, signed: true },
            { label: "지원사업", value: 2, unit: "건" },
        ],
    },
];

// [TargetRoller] 움직이는 텍스트
export const targetItems = [
    { label: "첫 창업을 시작하는 예비 창업자", icon: "/assets/icons/about_icon1.svg" },
    { label: "폐업을 고민하는 사장님", icon: "/assets/icons/about_icon2.svg" },
    { label: "매출이 떨어져 고민인 사장님", icon: "/assets/icons/about_icon3.svg" },
    { label: "이전/확장을 고민하는 사장님", icon: "/assets/icons/about_icon4.svg" },
];

// [Analysis] 체크 리스트
export const analysisPoints = [
    "반경 300m 안에 담긴 상권의 모든 데이터",
    "점수 근거 · 폐업률 · 임대료 위험 한눈에",
    "경쟁 · 고객 · 매출 탭으로 한 화면 비교",
];

// [Analysis Input] 체크 리스트 + 칩
export const inputPoints = [
    "몇 가지 조건만으로 창업에 필요한 핵심 지표를 확인",
    "창업 예산에 따른 손익분기점 분석",
    "내 창업 조건에 맞는 지원사업 추천",
];

export const inputChips = [
    { label: "신사동", active: true },
    { label: "커피 전문점", active: true },
    { label: "보증금 5,000", active: true },
    { label: "미정", active: false },
];

// [Situation] 상황별 카드
export const situations = [
    {
        tag: "예비 창업자",
        tagColor: "#2bb3a3",
        title: "이 자리, 계약해도 될까?",
        points: ["상권 점수와 그 이유", "업종별 폐업률 · 생존율", "임대료 위험 · 지원사업 매칭"],
        image: "/assets/icons/situation-store.svg",
    },
    {
        tag: "매출이 떨어지는 사장님",
        tagColor: "#2d5fae",
        title: "원인부터 찾고, 비교분석 해봐요",
        points: ["매출 변화 · 주변 상권 비교", "유동인구 · 경쟁 · 비용 원인 후보", "영업시간 · 메뉴 개선 시나리오"],
        image: "/assets/icons/situation-scale.svg",
    },
    {
        tag: "폐업 고민 사장님",
        tagColor: "#d9573c",
        title: "버틸지, 정리할지 근거로 판단",
        points: ["운영 지속 vs 폐업 비교", "손익분기 · 폐업 비용 체크", "재기 · 폐업 지원사업"],
        image: "/assets/icons/situation-panel.svg",
    },
];

// [Report] 체크 리스트
export const reportPoints = [
    "사업 계획의 주요 항목을 데이터와 비교해요",
    "상권 데이터 기반으로 입지와 경쟁력 진단",
    "부족한 부분을 찾아 맞춤형 개선 방향 제안",
];

// [Support] 지원사업 카드 (예시)
export const supportCards = [
    {
        status: "신청 가능",
        statusBg: "#5ef0dc",
        statusColor: "#06231f",
        title: "예비창업자 사업화 지원",
        tags: ["자부담", "중복 수혜 제한"],
    },
    {
        status: "불가",
        statusBg: "rgba(255,255,255,0.14)",
        statusColor: "#e8eef6",
        title: "청년 창업 공간 입주",
        tags: ["연령 제한"],
    },
    {
        status: "조건부",
        statusBg: "#f7c46c",
        statusColor: "#3a2400",
        title: "소상공인 창업 자금",
        tags: ["사업자 등록 후"],
    },
];

