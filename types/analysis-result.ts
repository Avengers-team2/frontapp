// 분석 결과 화면(창업 전 유형)
// 백엔드 응답(types/analysis.ts의 Analysis)을 화면용 형태로 변환해서 넣는다.

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
  score: number; // 0 ~ 100
  tone: ScoreTone;
}

export interface RiskFactor {
  item: string;
  actual: string;
  benchmark: string;
  level: "warn" | "normal";
}

export interface ImprovementSuggestion {
  label: string;
  from: string;
  to: string;
  reason: string;
}

export interface PreStartupResultView {
  title: string;
  conditionSummary: string;
  caveat: string;
  totalScore: number;
  scoreLabel: string;
  riskLabel: string;
  headline: string;
  description: string;
  scoreItems: ScoreItem[];
  closure: {
    openCount: number;
    closeCount: number;
    period: string;
    netChange: string;
    nextQuarterRisk: string;
  };
  riskFactors: RiskFactor[];
  suggestions: ImprovementSuggestion[];
}
