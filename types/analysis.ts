// ERD: analysis_input, analysis
export interface AnalysisInput {
  input_id: number;
  user_id: number;
  input_trdar_cd: string;
  input_industry_large: string;
  input_industry_mid: string;
  input_industry_small: string;
  input_store_size: string | null;
  input_is_franchise: boolean | null;
  input_franchise_brand: string | null;
  input_opening_time: string | null;
  input_closing_time: string | null;
  input_operating_days: string | null;
  input_target_ages: string | null;
  input_target_gender: string | null;
  input_extra_note: string | null;
  input_use_purpose: string | null;
  input_deposit_budget: number | null;
  input_monthly_rent_max: number | null;
  input_interior_budget_max: number | null;
  input_requested_at: string;
}

export interface Analysis {
  analysis_id: number;
  input_id: number;
  analysis_total_score: number | null;
  analysis_grade: string | null;
  analysis_sales_score: number | null;
  analysis_competition_score: number | null;
  analysis_customer_score: number | null;
  analysis_time_score: number | null;
  analysis_closure_score: number | null;
  analysis_stability_score: number | null;
  analysis_closure_grade: string | null;
  analysis_predicted_sales: number | null;
  analysis_predict_quarter: string | null;
  analysis_model_version: string | null;
  analysis_data_quarter: string;
  analysis_result_detail: unknown | null;
  analysis_is_saved: boolean;
  analysis_created_at: string;
}

// ── 정보판 (noData). ML 팀 응답을 그대로 저장한 값이라 안쪽 키는 camelCase 다 ──
export interface ReferenceSales {
  median: number | null; // 분기 매출 합계 중앙값 (원)
  low: number | null; // 25% 지점
  high: number | null; // 75% 지점
  count: number;
  basis: string; // "유동인구 등이 비슷한 상권 N곳의 같은 업종 현재 매출(당월 매출 기준) 중앙값과 25~75% 범위"
}

export interface NameShare {
  name: string;
  share: number; // 0~1
}

export interface AreaProfile {
  areaName: string | null;
  areaType: string | null; // 발달상권 · 골목상권 · 전통시장 · 관광특구
  changeIndicator: { code: string; name: string | null; meaning: string | null } | null;
  floatingPopulation: {
    total: number | null;
    topAgeGroup: NameShare | null;
    busiestTimeBand: NameShare | null;
    weekendShare: number | null; // 0~1
  } | null;
  operatingMonthsAvg: number | null; // 평균 운영 영업 개월
  closedMonthsAvg: number | null; // 평균 폐업 영업 개월
  industryCountInArea: number;
  storeCountInArea: number | null;
}

export interface OtherIndustryItem {
  industryCode: string;
  industryName: string | null;
  sales: number | null;
  storeCount: number | null;
  closeRate: number | null; // % 단위 숫자 (4.2 = 4.2%)
}

export interface SimilarAreaItem {
  areaCode: string;
  areaName: string | null;
  sales: number | null;
  storeCount: number | null;
  closeRate: number | null;
  openRate?: number | null; // 점포 수 기준일 때만
  floatingPopulation: number | null;
}

export interface SimilarAreas {
  summary: {
    basis: "sales" | "storeCount";
    count: number;
    closeRateAvg: number | null;
    storeCountMedian: number | null;
    // 매출 기준일 때
    topCustomerAge?: NameShare | null;
    topSalesTimeBand?: NameShare | null;
    femaleShare?: number | null;
    // 점포 수 기준일 때
    openRateAvg?: number | null;
    franchiseShare?: number | null;
  };
  top5: SimilarAreaItem[];
}

export interface InfoPanel {
  industryName?: string | null;
  areaProfile?: AreaProfile | null;
  otherIndustries?: { basis: "sales" | "storeCount"; items: OtherIndustryItem[] } | null;
  similarAreas?: SimilarAreas | null;
}

// GET /analyses/{input_id}/result 의 analysis_result_detail 형태
export interface AnalysisResultDetail {
  industry_code?: string;
  current_sales?: number; // 최근 분기 매출 (원)
  sales_change_rate?: number; // 현재 → 예측 매출 변화율 (-0.15 = -15%)
  closure_probability?: number; // 폐업 확률 (0.0097 = 0.97%)
  horizon?: number;
  store_count?: number;
  similar_store_count?: number;
  scoring_user?: {
    target_age?: Record<string, number>; // {"20": 0.5, "30": 0.5}
    hours?: [number, number][]; // [[11, 24], [0, 2]]
  };

  scoring_version?: string;
  // normal: 점수 화면 / noData: 점수 대신 "?"와 정보판. 없으면(옛 결과) normal 로 본다
  // (존재하지 않는 상권·업종이면 invalidInput 인데, 이 경우 서버가 400 으로 응답해서 여기 오지 않는다)
  estimate_type?: "normal" | "noData";
  reliability?: string | null; // "높음" | "보통" | "낮음" 등 결과 신뢰도 (noData 면 null)
  data_not_latest?: boolean; // true 면 최신 분기 데이터가 아님
  // 항목별 점수와 근거 문장. 입력하지 않은 항목은 score 가 null 이고 reason 에 사유가 올 수 있다
  indicators?: Record<string, { score: number | null; detail: string | null; reason: string | null }>;
  risks?: string[]; // 위험 요인 문장 (비어 있으면 섹션 숨김)
  improvements?: string[]; // 개선 방향 문장 (비어 있으면 섹션 숨김)

  // ── noData 일 때만 ──
  no_data_reason?: string | null; // "noRecord" | "unsupportedIndustry" | "areaWithoutSales" (여러 개면 쉼표로 이어짐)
  data_notice?: string | null; // 상단 안내 배너 문구
  reference_sales?: ReferenceSales | null; // 비슷한 상권의 같은 업종 매출 (이 상권의 예측이 아님)
  info_panel?: InfoPanel | null;

  // ── 차트용 값. Record 는 { 라벨: 값 } 형태 ──
  // Record 는 { 라벨: 값 } 형태. 값은 비율이든 금액이든 상관없이 화면에서 합계 대비 비중(%)으로 바꾼다.
  sales_by_weekday?: Record<string, number>; // 요일별 매출 { "월": ..., "화": ... }
  sales_by_hour?: Record<string, number>; // 시간대별 매출 { "06~11": ..., "11~14": ... }
  customer_by_age?: Record<string, number>; // 연령대별 손님 { "20": ..., "30": ... }
  customer_by_gender?: Record<string, number>; // 성별 손님 { "여": ..., "남": ... }
  foot_traffic?: {
    age?: Record<string, number>;
    hour?: Record<string, number>;
    weekday?: Record<string, number>;
  };
  open_close_trend?: { quarter: string; open: number; close: number }[]; // 최근 4분기
  compare_average?: { label: string; mine: number; average: number; unit?: string }[];
  rank_percent?: number; // 이 업종 점수 상위 N% (12 = 상위 12%)
}
