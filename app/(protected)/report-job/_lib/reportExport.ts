import { getReportResultData } from "./reportJob";

// ─────────────────────────────────────────
// 테스트용 스위치
// ─────────────────────────────────────────
export const MOCK_RESULT = {
    fail: false,    // true → "AI 응답을 받지 못했어요" 화면 (목업일 때만)
    useMock: false, // true → 백엔드 대신 아래 목업 데이터로 화면 확인
};

// name: 검토 보고서 항목 이름, shortName: 점수 카드용 짧은 이름
export type ScoreItem = { name: string; shortName: string; score: number; grade: string };
export type FixItem = { item: string; text: string };

export type ReportResult = {
    jobId: number;
    fileName: string;     // 원본 기획서 파일명
    title: string;        // 보고서 제목
    reviewedAt: string;   // 검토일
    total: number;        // 종합 점수
    totalGrade: string;   // 종합 등급 (우수 / 보통 / 미흡 / 매우 미흡)
    items: ScoreItem[];   // 항목별 점수 6개
    summary: string;      // 종합 의견
    fixes: FixItem[];     // 보완할 점
    pdf: { fileName: string; pages: number | null; size: string; url: string | null };
    originalUrl: string | null; // 원본 기획서 미리보기 주소
};

// 보완 필요 기준: 등급 "미흡" 이하 = 60점 미만 (백엔드 report_score_util과 같은 기준)
export const PASS_SCORE = 60;
export const isWeak = (score: number) => score < PASS_SCORE;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 검토 결과 불러오기
export async function getReportResult(jobId: number | null): Promise<ReportResult> {
    // 검토 요청 번호가 있으면 백엔드 결과 사용 (GET /reports/jobs/{id}/result)
    if (jobId !== null && !MOCK_RESULT.useMock) {
        return toReportResult(await getReportResultData(jobId));
    }

    // 아래는 화면 확인용 목업 (주소에 job 번호가 없을 때)
    await wait(600);
    if (MOCK_RESULT.fail) throw new Error("result failed");

    return {
        jobId: jobId ?? 0,
        fileName: "신사동_가로수길_카페_창업기획서.pdf",
        title: "신사동 가로수길 카페 창업 계획 — 검토 결과",
        reviewedAt: "2026.11.11",
        total: 72,
        totalGrade: "보통",
        items: [
            { name: "사업 아이템 및 차별성", shortName: "아이템·차별성", score: 80, grade: "우수" },
            { name: "시장성 및 고객 분석", shortName: "시장·고객", score: 60, grade: "보통" },
            { name: "사업 모델 및 수익성", shortName: "사업모델·수익성", score: 40, grade: "미흡" },
            { name: "마케팅 전략", shortName: "마케팅", score: 80, grade: "우수" },
            { name: "운영 및 실행 계획", shortName: "운영·실행", score: 60, grade: "보통" },
            { name: "위험 관리", shortName: "위험 관리", score: 40, grade: "미흡" },
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

// ─────────────────────────────────────────
// 백엔드 결과(ReportResultDTO) → 화면 데이터
// ─────────────────────────────────────────
const FIX_COUNT = 5; // 보완할 점: 개선 제안 우선순위 상위 5개

function formatBytes(bytes: number | null | undefined) {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function formatDate(iso: string | null | undefined) {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toReportResult(d: any): ReportResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: ScoreItem[] = (d.items ?? []).map((i: any) => ({
        name: i.label,
        shortName: i.shortLabel ?? i.label,
        score: i.score,
        grade: i.grade,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fixes: FixItem[] = (d.suggestions ?? []).slice(0, FIX_COUNT).map((s: any) => ({
        item: s.problem,
        text: s.action,
    }));

    return {
        jobId: d.reportJobId,
        fileName: d.fileName,
        title: d.businessItem ? `${d.businessItem} — 검토 결과` : "기획서 검토 결과",
        reviewedAt: formatDate(d.reviewedAt),
        total: d.totalScore ?? 0,
        totalGrade: d.totalGrade ?? "",
        items,
        summary: d.summary ?? "",
        fixes,
        pdf: { fileName: d.pdfFileName, pages: null, size: formatBytes(d.pdfSize), url: null },
        originalUrl: d.originalUrl ?? null,
    };
}

