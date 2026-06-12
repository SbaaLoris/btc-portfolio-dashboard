import { ArrowDownRight, ArrowUpRight, Banknote, Bitcoin, CalendarDays, Coins, LineChart, Trophy } from "lucide-react";

import type { PortfolioSummary } from "../../api/types";
import { Card, CardContent } from "../../components/ui/card";
import { formatBtc, formatCurrency } from "../../lib/format";

type SummaryCardsProps = {
  summary?: PortfolioSummary;
  loading: boolean;
};

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const cards = [
    {
      label: "BTC balance",
      value: summary ? formatBtc(summary.btc_balance) : "--",
      icon: Bitcoin,
    },
    {
      label: "Net invested",
      value: summary ? formatCurrency(summary.net_invested, summary.currency) : "--",
      icon: Banknote,
    },
    {
      label: "Average cost",
      value: summary ? formatCurrency(summary.average_cost, summary.currency) : "--",
      icon: Coins,
    },
    {
      label: "Unrealized PnL",
      value: summary ? formatCurrency(summary.unrealized_pnl, summary.currency) : "--",
      icon: summary && summary.unrealized_pnl >= 0 ? ArrowUpRight : ArrowDownRight,
      tone: summary && summary.unrealized_pnl >= 0 ? "text-emerald-600" : "text-red-600",
      sub: summary ? `${summary.pnl_percent >= 0 ? "+" : ""}${summary.pnl_percent.toFixed(2)}%` : "",
    },
    {
      label: "Current value",
      value: summary ? formatCurrency(summary.current_value, summary.currency) : "--",
      icon: LineChart,
    },
    {
      label: "Largest transaction",
      value: summary ? formatCurrency(summary.largest_transaction_amount, summary.currency) : "--",
      icon: Trophy,
      sub: summary ? `${summary.transaction_count} transactions` : "",
    },
    {
      label: "First entry",
      value: summary?.first_transaction_date
        ? new Date(summary.first_transaction_date).toLocaleDateString("de-CH", { month: "short", year: "numeric" })
        : "--",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">{card.label}</p>
              <p className="mt-2 text-xl font-semibold text-zinc-950">{loading ? "Loading..." : card.value}</p>
              {"sub" in card && card.sub ? <p className="mt-1 text-xs text-zinc-500">{card.sub}</p> : null}
            </div>
            <div className="rounded-md bg-zinc-100 p-2">
              <card.icon className={`h-5 w-5 ${card.tone ?? "text-zinc-600"}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
