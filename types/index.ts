export interface Customer {
  id: number;
  account_number: string;
  issue_date: string;
  interest_rate: string;
  tenure: number;
  emi_due: string;
}

export interface PaymentResponse {
  msg: string;
  payment: {
    payment_id: number;
    customer_id: number;
    payment_amount: string;
    status: string;
  };
  new_balance?: number;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Payment: { account: string };
};