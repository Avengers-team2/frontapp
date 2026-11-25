import type { MyAnalysisOption, SupportProgram } from "./support.api";

const DETAIL_URL = "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=";

const p = (
    id: string, title: string, organization: string, category: string, summary: string,
    start: string, end: string, tags: string[], regions: string[],
): SupportProgram => ({
    source: "kstartup", sourceId: id, title, organization, category, summary,
    startDate: start, endDate: end, tags, regions, detailUrl: DETAIL_URL + id,
});

export const PROGRAM_MOCK: SupportProgram[] = [
    p("179797", "정부지원사업 대비 「1:1 창업 멘토링」 참가자 모집", "강남구여성능력개발센터", "교육", "모두의 창업 등 정부지원사업 준비를 1:1 멘토링으로 도와줘요.", "2026-11-12", "2026-11-29", ["예비창업", "강남구", "멘토링"], ["서울"]),
    p("179630", "[은행연합회] 청년 소상공인 컨설팅 지원 사업", "한국생산성본부", "경영", "청년 소상공인에게 경영 컨설팅을 지원해요.", "2026-10-28", "2026-11-30", ["청년", "소상공인", "교육"], ["전국"]),
    p("179852", "2026년 12월 KICXUP 서울 입주기업 모집", "씨엔티테크(주)", "공간", "서울 창업 공간에 입주할 기업을 매달 모집해요.", "2026-11-20", "2026-12-06", ["입주", "창업공간", "서울"], ["서울"]),
];

export const MY_ANALYSIS_MOCK: MyAnalysisOption[] = [
    { inputId: 1, label: "내 분석 1", summary: "강남구 · 카페 · 예비 창업자", keywords: ["예비창업", "강남구", "교육", "서울"] },
];
