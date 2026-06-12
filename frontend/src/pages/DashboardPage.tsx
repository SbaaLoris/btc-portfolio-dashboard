import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bitcoin, LogOut, Plus, RefreshCw } from "lucide-react";

import { api } from "../api/client";
import type { Currency, Transaction, TransactionPayload } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { MarketChart } from "../features/portfolio/MarketChart";
import { MonthlyActivity } from "../features/portfolio/MonthlyActivity";
import { PortfolioChart } from "../features/portfolio/PortfolioChart";
import { SummaryCards } from "../features/portfolio/SummaryCards";
import { TransactionBubbleChart } from "../features/portfolio/TransactionBubbleChart";
import { TransactionDialog } from "../features/transactions/TransactionDialog";
import { TransactionsTable } from "../features/transactions/TransactionsTable";

const currency: Currency = "CHF";

export function DashboardPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);

  if (!auth.token) {
    throw new Error("Dashboard requires an auth token");
  }

  const token = auth.token;
  const summaryQuery = useQuery({
    queryKey: ["portfolio-summary", currency],
    queryFn: () => api.portfolioSummary(token, currency),
  });
  const historyQuery = useQuery({
    queryKey: ["portfolio-history", currency],
    queryFn: () => api.portfolioHistory(token, currency),
  });
  const marketPriceQuery = useQuery({
    queryKey: ["market-price", currency],
    queryFn: () => api.marketPrice(token, currency),
  });
  const marketChartQuery = useQuery({
    queryKey: ["market-chart", currency],
    queryFn: () => api.marketChart(token, currency),
  });
  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: () => api.transactions(token),
  });
  const monthlyActivityQuery = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: () => api.monthlyActivity(token),
  });

  const refreshPortfolio = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
    void queryClient.invalidateQueries({ queryKey: ["portfolio-history"] });
    void queryClient.invalidateQueries({ queryKey: ["monthly-activity"] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (payload: TransactionPayload) => api.createTransaction(token, payload),
    onSuccess: () => {
      setDialogOpen(false);
      refreshPortfolio();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TransactionPayload }) => api.updateTransaction(token, id, payload),
    onSuccess: () => {
      setDialogOpen(false);
      setEditingTransaction(null);
      refreshPortfolio();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (transaction: Transaction) => api.deleteTransaction(token, transaction.id),
    onSuccess: refreshPortfolio,
  });

  function openAddDialog() {
    setEditingTransaction(null);
    setDialogOpen(true);
  }

  function openEditDialog(transaction: Transaction) {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  }

  function submitTransaction(payload: TransactionPayload) {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const error =
    summaryQuery.error ??
    historyQuery.error ??
    marketPriceQuery.error ??
    marketChartQuery.error ??
    transactionsQuery.error ??
    monthlyActivityQuery.error ??
    createMutation.error ??
    updateMutation.error ??
    deleteMutation.error;

  return (
    <main className="min-h-screen bg-[#f6f7f9]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Bitcoin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-zinc-950">BTC Portfolio</h1>
              <p className="text-sm text-zinc-500">{auth.user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => queryClient.invalidateQueries()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              Add transaction
            </Button>
            <Button variant="ghost" onClick={auth.logout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:px-8">
        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="text-sm text-red-700">
              {error instanceof Error ? error.message : "Something went wrong"}
            </CardContent>
          </Card>
        ) : null}

        <SummaryCards summary={summaryQuery.data} loading={summaryQuery.isLoading} />

        <TransactionBubbleChart
          marketData={marketChartQuery.data ?? []}
          transactions={transactionsQuery.data ?? []}
          currency={currency}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <PortfolioChart data={historyQuery.data ?? []} currency={currency} />
          <MarketChart data={marketChartQuery.data ?? []} price={marketPriceQuery.data} currency={currency} />
        </div>

        <MonthlyActivity rows={monthlyActivityQuery.data ?? []} currency={currency} />

        <TransactionsTable
          transactions={transactionsQuery.data ?? []}
          onAdd={openAddDialog}
          onEdit={openEditDialog}
          onDelete={(transaction) => {
            if (window.confirm("Delete this transaction?")) {
              deleteMutation.mutate(transaction);
            }
          }}
        />
      </div>

      <TransactionDialog
        open={dialogOpen}
        transaction={editingTransaction}
        submitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setDialogOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={submitTransaction}
      />
    </main>
  );
}
