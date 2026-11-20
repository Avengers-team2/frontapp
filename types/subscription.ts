// ERD: subscriptions, payments
export interface Subscription {
  subscription_id: number;
  user_id: number;
  subscription_status: string;
  subscription_current_period_start: string;
  subscription_current_period_end: string;
  subscription_cancel_at_period_end: boolean;
  subscription_cancel_requested_at: string | null;
  subscription_created_at: string;
}

export interface Payment {
  payment_id: number;
  subscription_id: number;
  payment_order_id: string;
  payment_provider_tx_id: string | null;
  payment_amount: number;
  payment_status: string;
  payment_method: string | null;
  payment_paid_at: string;
  payment_created_at: string;
}
