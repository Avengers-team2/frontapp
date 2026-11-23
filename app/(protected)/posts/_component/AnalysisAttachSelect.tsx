"use client"

// TODO: 백엔드 연결 전 화면 확인용 가짜 데이터
//       → 마이페이지 "저장한 분석 결과" API가 생기면 useQuery로 바꾸고, 선택값을 글 작성 요청(analysis_id)에 넣기
const MOCK_SAVED_ANALYSES = [
    { analysis_id: 1, title: "강남구 신사동 · 신사역 이면 골목  ·  커피 전문점", score: 76, saved_at: "2026-11-04" },
    { analysis_id: 2, title: "강남구 신사동 · 가로수길 메인  ·  커피 전문점", score: 73, saved_at: "2026-11-02" },
];

interface AnalysisAttachSelectProps {
    selectedId: number | null;
    onSelect: (analysisId: number | null) => void;
}

// 날짜 → "11.04" 형식
const formatDate = (value: string) => {
    const d = new Date(value);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

// 분석 결과 첨부 (선택) — 마이페이지에 저장한 분석 결과 중 하나 고르기
export default function AnalysisAttachSelect({selectedId, onSelect}: AnalysisAttachSelectProps) {
    return (
        <div>
            <p className="text-base font-bold text-ink-900">분석 결과 첨부 (선택)</p>

            <div className="mt-2.75 flex flex-col gap-2.75">
                {MOCK_SAVED_ANALYSES.map((analysis) => {
                    const isSelected = selectedId === analysis.analysis_id;
                    return (
                        <button
                            key={analysis.analysis_id}
                            type="button"
                            onClick={() => onSelect(isSelected ? null : analysis.analysis_id)}
                            className={`flex w-full items-center justify-between rounded-xl border bg-white px-5 py-4 text-left ${
                                isSelected ? "border-[#CFE9E4]" : "border-line-light"
                            }`}
                        >
                            <span className="flex items-center gap-3.5">
                                {isSelected ? (
                                    <span className="flex size-5 items-center justify-center rounded-full bg-sub">
                                        <span className="size-2 rounded-full bg-ink-900" />
                                    </span>
                                ) : (
                                    <span className="size-5 rounded-full border-[1.5px] border-main" />
                                )}
                                <span className="whitespace-pre text-base font-medium text-ink-900">{analysis.title}</span>
                            </span>
                            <span className="text-base text-ink-300">
                                {analysis.score}점 · {formatDate(analysis.saved_at)} 저장
                            </span>
                        </button>
                    );
                })}
                <p className="text-base text-ink-300">마이페이지에 저장한 분석 결과만 첨부할 수 있어요.</p>
            </div>
        </div>
    );
}
