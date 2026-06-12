export type Currency = "CHF" | "USD" | "EUR";
export type TransactionType = "buy" | "sell";

export type User = {
  id: number;
  email: string;
  default_currency: Currency;
  created_at: string;
};

export type AuthToken = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type TransactionPayload = {
  type: TransactionType;
  btc_amount: number;
  fiat_amount: number;
  currency: Currency;
  fee_amount: number;
  transaction_date: string;
  note: string | null;
};

export type Transaction = TransactionPayload & {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioSummary = {
  currency: Currency;
  btc_balance: number;
  average_cost: number;
  total_invested: number;
  net_invested: number;
  total_fees: number;
  current_price: number;
  current_value: number;
  unrealized_pnl: number;
  realized_pnl: number;
  pnl_percent: number;
  largest_transaction_amount: number;
  transaction_count: number;
  first_transaction_date: string | null;
  updated_at: string;
};

export type PortfolioHistoryPoint = {
  timestamp: string;
  btc_balance: number;
  price: number;
  value: number;
};

export type MarketPrice = {
  currency: Currency;
  price: number;
  market_cap: number | null;
  volume_24h: number | null;
  change_24h: number | null;
  updated_at: string;
};

export type MarketChartPoint = {
  timestamp: string;
  price: number;
};

export type MonthlyActivity = {
  month: string;
  buy_amount: number;
  sell_amount: number;
  net_amount: number;
  btc_amount: number;
  transaction_count: number;
};
