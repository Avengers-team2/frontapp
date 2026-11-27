import { getReportResultData } from "./reportJob";

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

// 검토 결과 불러오기 (GET /reports/jobs/{id}/result)
export async function getReportResult(jobId: number | null): Promise<ReportResult> {
    // 주소에 검토 요청 번호(job)가 없으면 결과를 불러올 수 없으므로 오류 화면으로 보낸다
    if (jobId === null) throw new Error("검토 요청 번호가 없어요.");
    return toReportResult(await getReportResultData(jobId));
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

