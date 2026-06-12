import { ArrowDownRight, ArrowUpRight, Banknote, Bitcoin, Coins, LineChart } from "lucide-react";

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
      label: "Current value",
      value: summary ? formatCurrency(summary.current_value, summary.currency) : "--",
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
    },
    {
      label: "Realized PnL",
      value: summary ? formatCurrency(summary.realized_pnl, summary.currency) : "--",
      icon: LineChart,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-500">{card.label}</p>
              <p className="mt-2 text-xl font-semibold text-zinc-950">{loading ? "Loading..." : card.value}</p>
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

