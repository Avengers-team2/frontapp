import type { PreStartupResultView } from "@/types/analysis-result";

// 백엔드 연동 전 목 데이터. 실제 API가 붙으면 이 객체 대신 응답 변환 결과를 넘기면 된다.
export const PRE_STARTUP_MOCK: PreStartupResultView = {
  title: "신사동 · 커피 전문점",
  conditionSummary:
    "보증금 5,000 · 월세 ≤300만원 · 20~40m² · 07~18시 · 직장인 · 방문객(가정)",
  caveat: "가정에 따른 추정 · 매출·비용·회수 결과 보장 아님",
  totalScore: 73,
  scoreLabel: "종합 적합도 · 0~100",
  riskLabel: "주의 · 폐업 위험",
  headline: "매출 잠재력은 높지만,\n폐업이 잦아 안정성은 주의가 필요해요",
  description:
    "매출 잠재력 · 고객층 · 시간대 · 폐업 위험 · 상권 안정성 5개 항목 종합 · 가중치 확인 필요",
  scoreItems: [
    { id: "sales", label: "매출 잠재력", score: 85, tone: "default" },
    { id: "customer", label: "고객층 적합성", score: 80, tone: "default" },
    { id: "time", label: "시간대 적합성", score: 74, tone: "default" },
    { id: "closure", label: "폐업 위험 (낮을수록 높은 점수)", score: 60, tone: "warn" },
    { id: "stability", label: "상권 안정성", score: 66, tone: "default" },
  ],
  closure: {
    openCount: 9,
    closeCount: 6,
    period: "최근 4분기",
    netChange: "순증 +3곳",
    nextQuarterRisk: "보통",
  },
  riskFactors: [
    {
      item: "폐업 위험",
      actual: "최근 1년 폐업 6곳",
      benchmark: "강남구 커피 전문점 평균 · 확인 필요",
      level: "warn",
    },
    {
      item: "상권 안정성",
      actual: "점포 수 순증 +3곳",
      benchmark: "직전 4분기 대비",
      level: "normal",
    },
  ],
  suggestions: [
    {
      label: "운영 시간",
      from: "07–18시",
      to: "07–14시 집중",
      reason: "출근 · 점심 시간대 매출 비중이 높아요",
    },
    {
      label: "업종 · 형태",
      from: "커피 전문점",
      to: "소형 테이크아웃",
      reason: "대형 카페가 많은 상권이에요",
    },
  ],
};
