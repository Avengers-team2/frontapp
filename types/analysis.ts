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
