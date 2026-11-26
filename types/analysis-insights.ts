// GET /analyses/{input_id}/insights 응답 (body.data). 결과 화면의 "추가 정보" 영역에 쓴다.
// 금액은 모두 원 단위의 분기(3개월) 매출 합계이고, 화면에서는 "분기 매출 합계"로 표기한다.
// 비율(share, ratio, rate 중 *_ratio)은 0~1, open_rate·close_rate 는 % 단위 숫자(4.2 = 4.2%)다.

export interface FrontIndustry {
  large: string;
  mid: string;
  small: string | null; // null 이면 중분류 전체
}

// ① 이 상권에서 점포가 많은 업종
export interface AreaIndustryItem {
  rank: number;
  industry_code: string;
  industry_name: string | null;
  front_industry: FrontIndustry | null;
  store_count: number;
  share: number | null; // 0~1
  open_rate: number | null;
  close_rate: number | null;
  franchise_count: number;
  franchise_ratio: number | null; // 0~1
  has_sales_data: boolean; // false 면 점수 분석이 안 되는 조합
}

export interface AreaIndustries {
  total_store_count: number;
  industry_kind_count: number;
  top: AreaIndustryItem[]; // 상위 10개
  my_industry: AreaIndustryItem | null; // 선택 업종 순위 (이 상권에 점포가 없으면 null)
}

// ② 매출 추세와 예측
export interface SalesTrendPoint {
  quarter: string; // "20244"
  sales: number;
  kind: "actual" | "predicted";
}

export interface ForecastPoint {
  horizon: number; // 1~5 (몇 분기 뒤)
  quarter: string;
  predicted_sales: number;
  change_rate: number; // -0.08 = -8%
  closure_probability: number; // 0~1
  is_selected: boolean; // 이번 분석이 기준으로 삼은 예측
}

// ③ 다른 업종 추천
export interface RecommendedIndustry {
  industry_code: string;
  industry_name: string | null;
  front_industry: FrontIndustry | null;
  total_score: number | null;
  sales_score: number | null;
  competition_score: number | null;
  closure_score: number | null;
  stability_score: number | null;
  store_count: number;
  sales_change_rate: number | null;
}

export interface RecommendedIndustries {
  basis: string;
  candidate_count: number;
  my_industry_rank: number | null;
  items: RecommendedIndustry[]; // 0~5개
}

// ④ 상권 비교 (같은 업종 기준)
export interface CompareRowData {
  label: string; // 매출 · 점포당 매출 · 점포 수 · 폐업률 · 개업률 · 유동인구
  unit: string; // 원 · 개 · % · 명
  mine: number | null;
  gu_average: number | null;
  seoul_average: number | null;
}

export interface GuTopArea {
  area_code: string;
  area_name: string | null;
  sales: number | null;
  store_count: number;
  close_rate: number | null;
  is_mine: boolean;
}

export interface AreaCompare {
  gu: string | null;
  gu_area_count: number;
  seoul_area_count: number;
  gu_rank: { sales_rank: number; total: number } | null;
  rows: CompareRowData[] | null;
  gu_top_areas: GuTopArea[];
}

// ⑤ 프랜차이즈 비중
export interface FranchiseShare {
  franchise_store_count: number;
  store_count: number;
  ratio: number | null; // 0~1, 점포가 0개면 null
  seoul_average_ratio: number | null; // 0~1
}

export interface AnalysisInsights {
  area_code: string;
  industry_code: string;
  industry_name: string | null;
  base_quarter: string; // "20254"
  has_sales_data: boolean; // false 면 sales_trend · forecast · area_compare.rows · franchise 가 null
  area_industries: AreaIndustries | null;
  sales_trend: SalesTrendPoint[] | null;
  forecast: ForecastPoint[] | null;
  recommended_industries: RecommendedIndustries | null;
  area_compare: AreaCompare | null;
  franchise: FranchiseShare | null;
  notice: string | null;
}
