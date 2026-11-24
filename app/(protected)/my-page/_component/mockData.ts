import { PostCategory } from "@/enums/post.enum";

// TODO: 백엔드 API가 생기면 이 가짜 데이터를 API 조회로 바꾸기 (Figma 예시 값)

// 프로필 (로그인 정보가 없을 때 보여줄 값)
export const MOCK_PROFILE = {
    nickname: "홍길동",
    email: "honghong@startfit.kr",
    businessStatus: "예비 창업자",
    region: "강남구 신사동",
    industry: "커피 전문점",
};

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

// 내가 쓴 글 (TODO: 로그인 연결 후 GET /post/me API로 바꾸기 — getMyPostsApi)
export const MOCK_MY_POSTS: {
    post_id: number;
    post_category: PostCategory;
    post_title: string;
    post_comment_count: number;
    post_created_at: string;
}[] = [
    { post_id: 3, post_category: PostCategory.MARKET_INFO, post_title: "신사역 이면 vs 가로수길, 직접 다녀와 봤어요 (분석 결과 첨부)", post_comment_count: 18, post_created_at: "2026-11-04" },
    { post_id: 11, post_category: PostCategory.FREE, post_title: "창업 준비하면서 제일 막막했던 순간", post_comment_count: 4, post_created_at: "2026-11-02" },
    { post_id: 21, post_category: PostCategory.SUPPORT_QNA, post_title: "예비창업패키지 서류 준비 순서 공유해요", post_comment_count: 0, post_created_at: "2026-10-30" },
    { post_id: 22, post_category: PostCategory.REVIEW, post_title: "상권 분석 처음 해 본 후기", post_comment_count: 7, post_created_at: "2026-10-27" },
    { post_id: 23, post_category: PostCategory.MARKET_INFO, post_title: "가로수길 평일 오전 유동인구 직접 세 봤어요", post_comment_count: 2, post_created_at: "2026-10-21" },
];
