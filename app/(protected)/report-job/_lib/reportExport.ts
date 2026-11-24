// ─────────────────────────────────────────
// 테스트용 스위치
// ─────────────────────────────────────────
export const MOCK_RESULT = {
    fail: false, // true → "AI 응답을 받지 못했어요" 화면
};

export type ScoreItem = { name: string; score: number };
export type FixItem = { item: string; text: string };

export type ReportResult = {
    jobId: number;
    fileName: string;     // 원본 기획서 파일명
    title: string;        // 보고서 제목
    reviewedAt: string;   // 검토일
    total: number;        // 종합 점수
    items: ScoreItem[];   // 항목별 점수 6개
    summary: string;      // 종합 의견
    fixes: FixItem[];     // 보완할 점
    pdf: { fileName: string; pages: number; size: string; url: string | null };
    originalUrl: string | null; // 원본 기획서 미리보기 주소
};

// 70점 미만은 보완 필요
export const PASS_SCORE = 70;
export const isWeak = (score: number) => score < PASS_SCORE;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 검토 결과 불러오기
export async function getReportResult(jobId: number | null): Promise<ReportResult> {
    // TODO: 백엔드 연결 시 교체
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/report-jobs/${jobId}/result`, { credentials: "include" });
    // if (!res.ok) throw new Error("result failed");
    // return res.json();

    await wait(600);
    if (MOCK_RESULT.fail) throw new Error("result failed");

    return {
        jobId: jobId ?? 0,
        fileName: "신사동_가로수길_카페_창업기획서.pdf",
        title: "신사동 가로수길 카페 창업 계획 — 검토 결과",
        reviewedAt: "2026.11.11",
        total: 72,
        items: [
            { name: "창업 아이템 개요", score: 84 },
            { name: "시장 · 고객 분석", score: 64 },
            { name: "매출 추정", score: 58 },
            { name: "자금 조달 계획", score: 60 },
            { name: "마케팅 계획", score: 78 },
            { name: "대표자 역량 · 팀 구성", score: 88 },
        ],
        summary:
            "아이템과 대표자 역량은 잘 드러나 있지만, 매출 추정과 자금 조달 계획의 근거가 부족해요. 숫자의 계산 과정을 보완하면 설득력이 높아질 거예요.",
        fixes: [
            { item: "시장 · 고객 분석", text: "목표 고객 규모와 근거를 수치로 적어 주세요." },
            { item: "매출 추정", text: "객단가 · 하루 판매량 같은 계산 근거가 빠져 있어요." },
            { item: "자금 조달 계획", text: "자부담 비율과 조달 일정을 표로 정리해 보세요." },
        ],
        pdf: {
            fileName: "신사동_가로수길_카페_창업기획서_검토보고서_종합.pdf",
            pages: 3,
            size: "2.4MB",
            url: null, // 백엔드 연결 후 PDF 주소
        },
        originalUrl: null,
    };
}