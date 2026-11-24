// TODO: 백엔드 API가 생기면 이 가짜 데이터를 API 조회로 바꾸기 (Figma 예시 값)

// 내 분석 (저장한 분석)
export const MOCK_ANALYSES = [
    { analysis_id: 1, industry: "커피 전문점", title: "[강남구 신사동] 신사역 이면 골목", score: 76, saved_at: "2026-11-04" },
    { analysis_id: 2, industry: "커피 전문점", title: "[강남구 신사동] 가로수길 메인", score: 73, saved_at: "2026-11-02" },
    { analysis_id: 3, industry: "커피 전문점", title: "[강남구 신사동] 압구정로데오 방향", score: 69, saved_at: "2026-10-28" },
    { analysis_id: 4, industry: "디저트 카페", title: "[강남구 신사동] 가로수길 메인", score: 70, saved_at: "2026-10-25" },
];

// 관심 지원사업 (지원사업 북마크)
export const MOCK_SUPPORT_BOOKMARKS = [
    { id: 1, dday: 1, tag: "창업교육", title: "[로컬창업트랙 2기] 기억되는 브랜드가 되는 법", org: "관악구청 · 접수 2026.10.19 – 11.12", url: "https://www.k-startup.go.kr", bookmarked: false },
    { id: 2, dday: 2, tag: "시설 · 공간", title: "(하반기) 2026년 서울창업허브 M+ 입주기업 모집", org: "서울경제진흥원 · 접수 2026.11.02 – 11.13", url: "https://www.k-startup.go.kr", bookmarked: true },
    { id: 3, dday: 9, tag: "시설 · 공간", title: "2027년 서울시 청년 쿡 비즈니스 센터 참여 스타트업 모집", org: "서울특별시 · 청년쿡비즈니스센터 · 접수 2026.11.02 – 11.20", url: "https://www.k-startup.go.kr", bookmarked: false },
    { id: 4, dday: 15, tag: "시설 · 공간", title: "2026년 키친인큐베이터 개별 · 공유주방 25기 및 제조주방 13기 모집", org: "서울경제진흥원 · 접수 2026.11.02 – 11.26", url: "https://www.k-startup.go.kr", bookmarked: true },
];

// 사업자 상태 선택지 (회원정보 수정)
export const BUSINESS_STATUS_OPTIONS = ["예비 창업자", "운영 중", "폐업 예정", "가게 이전", "미정"];
