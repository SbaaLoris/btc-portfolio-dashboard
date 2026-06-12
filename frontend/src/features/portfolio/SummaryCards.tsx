import { ArrowDownRight, ArrowUpRight, Banknote, Bitcoin, CalendarDays, Coins, LineChart, Trophy, type LucideIcon } from "lucide-react";

import type { PortfolioSummary } from "../../api/types";
import { Card, CardContent } from "../../components/ui/card";
import { formatBtc, formatCurrency } from "../../lib/format";

type SummaryCardsProps = {
  summary?: PortfolioSummary;
  loading: boolean;
};

type SummaryCard = {
  label: string;
  value: string;
  icon: LucideIcon;
  sub?: string;
  tone?: string;
  accent?: string;
  spotlight?: boolean;
};

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const cards: SummaryCard[] = [
    {
      label: "BTC balance",
      value: summary ? formatBtc(summary.btc_balance) : "--",
      icon: Bitcoin,
      accent: "from-amber-400 to-orange-500",
      spotlight: true,
    },
    {
      label: "Net invested",
      value: summary ? formatCurrency(summary.net_invested, summary.currency) : "--",
      icon: Banknote,
      accent: "from-zinc-700 to-zinc-950",
    },
    {
      label: "Average cost",
      value: summary ? formatCurrency(summary.average_cost, summary.currency) : "--",
      icon: Coins,
      accent: "from-amber-300 to-amber-500",
    },
    {
      label: "Unrealized PnL",
      value: summary ? formatCurrency(summary.unrealized_pnl, summary.currency) : "--",
      icon: summary && summary.unrealized_pnl >= 0 ? ArrowUpRight : ArrowDownRight,
      tone: summary && summary.unrealized_pnl >= 0 ? "text-emerald-600" : "text-red-600",
      sub: summary ? `${summary.pnl_percent >= 0 ? "+" : ""}${summary.pnl_percent.toFixed(2)}%` : "",
      accent: summary && summary.unrealized_pnl >= 0 ? "from-emerald-400 to-teal-500" : "from-red-400 to-rose-500",
    },
    {
      label: "Current value",
      value: summary ? formatCurrency(summary.current_value, summary.currency) : "--",
      icon: LineChart,
      accent: "from-zinc-800 to-zinc-950",
    },
    {
      label: "Largest transaction",
      value: summary ? formatCurrency(summary.largest_transaction_amount, summary.currency) : "--",
      icon: Trophy,
      sub: summary ? `${summary.transaction_count} transactions` : "",
      accent: "from-amber-500 to-zinc-900",
    },
    {
      label: "First entry",
      value: summary?.first_transaction_date
        ? new Date(summary.first_transaction_date).toLocaleDateString("de-CH", { month: "short", year: "numeric" })
        : "--",
      icon: CalendarDays,
      accent: "from-zinc-500 to-zinc-800",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={card.spotlight ? "overflow-hidden bg-zinc-950 text-white md:col-span-2 xl:col-span-1" : "overflow-hidden"}
        >
          <CardContent className="relative flex min-h-[138px] items-start justify-between gap-4">
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent ?? "from-zinc-300 to-zinc-400"}`} />
            <div className="min-w-0">
              <p className={card.spotlight ? "text-sm font-medium text-zinc-300" : "text-sm font-medium text-zinc-500"}>
                {card.label}
              </p>
              <p className={`mt-3 break-words text-2xl font-black tabular-nums ${card.spotlight ? "text-white" : "text-zinc-950"}`}>
                {loading ? "Loading..." : card.value}
              </p>
              {card.sub ? (
                <p className={`mt-2 text-sm font-semibold ${card.tone ?? (card.spotlight ? "text-amber-200" : "text-zinc-500")}`}>
                  {card.sub}
                </p>
              ) : null}
            </div>
            <div className={card.spotlight ? "rounded-2xl bg-white/10 p-2.5" : "rounded-2xl bg-zinc-100 p-2.5"}>
              <card.icon className={`h-5 w-5 ${card.tone ?? (card.spotlight ? "text-amber-300" : "text-zinc-600")}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
