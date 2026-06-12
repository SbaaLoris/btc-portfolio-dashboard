import type {
  AuthToken,
  Currency,
  MarketChartPoint,
  MarketPrice,
  PortfolioHistoryPoint,
  PortfolioSummary,
  Transaction,
  TransactionPayload,
  User,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = (await response.json()) as { detail?: string };
      message = payload.detail ?? message;
    } catch {
      // Keep the HTTP status text when no JSON error body exists.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  register(email: string, password: string) {
    return apiFetch<AuthToken>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  login(email: string, password: string) {
    return apiFetch<AuthToken>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  me(token: string) {
    return apiFetch<User>("/auth/me", {}, token);
  },
  transactions(token: string) {
    return apiFetch<Transaction[]>("/transactions", {}, token);
  },
  createTransaction(token: string, payload: TransactionPayload) {
    return apiFetch<Transaction>(
      "/transactions",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    );
  },
  updateTransaction(token: string, transactionId: number, payload: TransactionPayload) {
    return apiFetch<Transaction>(
      `/transactions/${transactionId}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token,
    );
  },
  deleteTransaction(token: string, transactionId: number) {
    return apiFetch<void>(`/transactions/${transactionId}`, { method: "DELETE" }, token);
  },
  portfolioSummary(token: string, currency: Currency) {
    return apiFetch<PortfolioSummary>(`/portfolio/summary?currency=${currency}`, {}, token);
  },
  portfolioHistory(token: string, currency: Currency, range = "30d") {
    return apiFetch<PortfolioHistoryPoint[]>(
      `/portfolio/history?currency=${currency}&range=${range}`,
      {},
      token,
    );
  },
  marketPrice(token: string, currency: Currency) {
    return apiFetch<MarketPrice>(`/market/btc/price?currency=${currency}`, {}, token);
  },
  marketChart(token: string, currency: Currency, range = "30d") {
    return apiFetch<MarketChartPoint[]>(`/market/btc/chart?currency=${currency}&range=${range}`, {}, token);
  },
};

