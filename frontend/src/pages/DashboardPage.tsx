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
import { downloadTransactionsCsv, parseTransactionsCsv } from "../features/transactions/csv";
import { TransactionDialog } from "../features/transactions/TransactionDialog";
import { TransactionsTable } from "../features/transactions/TransactionsTable";

const currency: Currency = "CHF";

export function DashboardPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [csvMessage, setCsvMessage] = React.useState<string | null>(null);
  const [csvError, setCsvError] = React.useState<string | null>(null);

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
  const importCsvMutation = useMutation({
    mutationFn: async (file: File) => {
      const payloads = parseTransactionsCsv(await file.text());
      for (const payload of payloads) {
        await api.createTransaction(token, payload);
      }
      return payloads.length;
    },
    onSuccess: (count) => {
      setCsvError(null);
      setCsvMessage(`Imported ${count} transactions from CSV.`);
      refreshPortfolio();
    },
    onError: (err) => {
      setCsvMessage(null);
      setCsvError(err instanceof Error ? err.message : "CSV import failed.");
    },
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfcfd_0%,#f1f4f8_42%,#e8edf4_100%)] text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-zinc-950 shadow-[0_16px_35px_rgba(217,119,6,0.28)]">
              <Bitcoin className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-zinc-950 sm:text-2xl">BTC Portfolio</h1>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-amber-700">
                  {currency}
                </span>
              </div>
              <p className="truncate text-sm text-zinc-500">{auth.user?.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden rounded-2xl border border-zinc-200/80 bg-white/75 px-3 py-2 text-right shadow-sm md:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">BTC spot</p>
              <p className="font-semibold tabular-nums text-zinc-950">
                {marketPriceQuery.data ? `${marketPriceQuery.data.price.toLocaleString("de-CH")} ${currency}` : "Loading"}
              </p>
            </div>
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

      <div className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 lg:px-8">
        {error ? (
          <Card className="border-red-200 bg-red-50 shadow-none">
            <CardContent className="text-sm font-medium text-red-700">
              {error instanceof Error ? error.message : "Something went wrong"}
            </CardContent>
          </Card>
        ) : null}
        {csvMessage ? (
          <Card className="border-emerald-200 bg-emerald-50 shadow-none">
            <CardContent className="text-sm font-medium text-emerald-700">{csvMessage}</CardContent>
          </Card>
        ) : null}
        {csvError ? (
          <Card className="border-red-200 bg-red-50 shadow-none">
            <CardContent className="text-sm font-medium text-red-700">{csvError}</CardContent>
          </Card>
        ) : null}

        <SummaryCards summary={summaryQuery.data} loading={summaryQuery.isLoading} />

        <TransactionBubbleChart
          marketData={marketChartQuery.data ?? []}
          transactions={transactionsQuery.data ?? []}
          currency={currency}
        />

        <div className="grid gap-5 xl:grid-cols-2">
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
          onExportCsv={() => downloadTransactionsCsv(transactionsQuery.data ?? [])}
          onImportCsv={(file) => importCsvMutation.mutate(file)}
          importing={importCsvMutation.isPending}
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
