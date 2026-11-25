// 게시판 Enum — 백엔드 Enum과 값이 같아야 한다

// 게시글 분류
export enum PostCategory {
    REVIEW = "REVIEW",             // 창업 후기
    MARKET_INFO = "MARKET_INFO",   // 상권 정보
    SUPPORT_QNA = "SUPPORT_QNA",   // 지원사업 Q&A
    FREE = "FREE",                 // 자유
    NOTICE = "NOTICE",             // 공지
}   

// 분류 한글 라벨 (화면 표시용)
export const PostCategoryLabel: Record<PostCategory, string> = {
    [PostCategory.REVIEW]: "창업 후기",
    [PostCategory.MARKET_INFO]: "상권 정보",
    [PostCategory.SUPPORT_QNA]: "지원사업 Q&A",
    [PostCategory.FREE]: "자유",
    [PostCategory.NOTICE]: "공지",
};

// 일반 사용자가 쓸 수 있는 분류 (글쓰기 주제 선택, 분류 탭에 사용 / 공지 제외)
export const PostWritableCategories: PostCategory[] = [
    PostCategory.REVIEW,
    PostCategory.MARKET_INFO,
    PostCategory.SUPPORT_QNA,
    PostCategory.FREE,
];

// 정렬 기준
export enum PostSort {
    LATEST = "LATEST",   // 최신순
    OLDEST = "OLDEST",   // 오래된순
    VIEWS = "VIEWS",     // 조회수순
    LIKES = "LIKES",     // 좋아요순
}

// 정렬 한글 라벨 (화면 표시용)
export const PostSortLabel: Record<PostSort, string> = {
    [PostSort.LATEST]: "최신순",
    [PostSort.OLDEST]: "오래된순",
    [PostSort.VIEWS]: "조회수순",
    [PostSort.LIKES]: "좋아요순",
};