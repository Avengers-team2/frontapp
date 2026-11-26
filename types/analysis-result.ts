// 분석 결과 화면(창업 전 유형)
// 백엔드 응답(types/analysis.ts의 Analysis)을 화면용 형태로 변환해서 넣는다.
import type { InfoPanel, ReferenceSales } from "./analysis";

export type AnalysisStepStatus = "done" | "running" | "waiting";

export interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  status: AnalysisStepStatus;
}

export type ScoreTone = "default" | "warn";

export interface ScoreItem {
  id: string;
  label: string;
  score: number; // 0 ~ 100 (score 가 없는 항목은 excluded 라 쓰지 않는다)
  tone: ScoreTone;
  excluded?: boolean; // 점수가 없는 항목 (입력하지 않아 빠졌거나 점수를 낼 수 없는 경우). 점수 자리에 "?"를 보여준다
  detail?: string; // 점수 근거 한 줄, 점수가 없으면 그 사유 (서버 문장)
}

// 차트 한 칸. value 는 비중(%)이다.
export interface ChartItem {
  label: string;
  value: number;
}

// 분기별 개업·폐업 점포 수
export interface TrendPoint {
  quarter: string;
  open: number;
  close: number;
}

// 같은 구·업종 평균과 비교
export interface CompareRow {
  label: string;
  mine: string;
  average: string;
  note?: string; // 예: "평균보다 12% 높음"
}

export interface ResultStat {
  label: string;
  value: string;
  note?: string;
}

// 참고용 예측 매출 (보조 정보. 오차가 커서 강조하지 않는다)
export interface PredictionNote {
  value: string; // "79.6억원"
  quarter: string; // "2027년 1분기"
  baseQuarter: string; // 데이터 기준 분기 "2025년 4분기"
  changeRate?: string; // "현재 대비 -15.1%"
}

export interface PreStartupResultView {
  kind: "normal" | "noData"; // noData 는 점수 대신 "?"와 정보판
  industryCode?: string; // 모델 업종 코드. 점포 조회(지도 마커·경쟁 현황)에 쓴다
  title: string;
  conditionSummary: string;
  caveat: string;
  notice?: string; // 상단 안내 배너 (noData 의 dataNotice)
  staleNotice?: string; // "최신 데이터가 아닐 수 있습니다"
  totalScore: number | null; // null 이면 "?"
  scoreLabel: string;
  reliabilityLabel?: string; // "신뢰도 높음"
  riskLabel?: string; // 폐업 위험 등급 (noData 에는 없다)
  headline: string;
  description: string;
  scoreItems: ScoreItem[];
  riskTone: "safe" | "caution" | "warn"; // 낮음 초록 · 보통 노랑 · 높음 빨강
  prediction?: PredictionNote;
  dataQuarterLabel: string; // 정보판·예측의 기준 분기 "2025년 4분기"
  rankLabel?: string; // "이 업종에서 점수 상위 12%"
  referenceSales?: ReferenceSales; // noData: 비슷한 상권의 같은 업종 매출
  infoPanel?: InfoPanel; // noData: 정보판 (값이 null 인 섹션은 화면에서 숨긴다)
  evidence: {
    title: string;
    stats: ResultStat[];
  };
  competition?: ResultStat[]; // 경쟁 현황 (점포 수, 유사 업종 점포 수)
  // 아래는 서버가 데이터를 주면 채워지고, 없으면 화면에서 숨겨진다
  salesByWeekday?: ChartItem[];
  salesByHour?: ChartItem[];
  customerByAge?: ChartItem[];
  customerByGender?: ChartItem[];
  footTraffic?: { byAge?: ChartItem[]; byHour?: ChartItem[]; byWeekday?: ChartItem[] };
  openCloseTrend?: TrendPoint[];
  compareAverage?: CompareRow[];
  risks: string[]; // 위험 요인 문장 (비면 섹션 숨김)
  improvements: string[]; // 개선 방향 문장 (비면 섹션 숨김)
}
