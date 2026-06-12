import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import type { Currency, MarketChartPoint, Transaction } from "../../api/types";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatBtc, formatCurrency } from "../../lib/format";

type BubblePoint = {
  timestamp: number;
  price: number;
  amount: number;
  btc: number;
  type: "buy" | "sell";
  note: string | null;
};

export function TransactionBubbleChart({
  marketData,
  transactions,
  currency,
}: {
  marketData: MarketChartPoint[];
  transactions: Transaction[];
  currency: Currency;
}) {
  const lineData = marketData.map((point) => ({
    timestamp: new Date(point.timestamp).getTime(),
    price: point.price,
  }));
  const bubbleData: BubblePoint[] = transactions.map((transaction) => ({
    timestamp: new Date(transaction.transaction_date).getTime(),
    price: transaction.fiat_amount / transaction.btc_amount,
    amount: transaction.fiat_amount,
    btc: transaction.btc_amount,
    type: transaction.type,
    note: transaction.note,
  }));
  const buys = bubbleData.filter((point) => point.type === "buy");
  const sells = bubbleData.filter((point) => point.type === "sell");
  const maxAmount = Math.max(...bubbleData.map((point) => point.amount), 1);

  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-zinc-800 bg-zinc-900/70">
        <div>
          <CardTitle className="text-zinc-200">BTC price with entries</CardTitle>
          <p className="mt-1 text-sm text-zinc-400">Bubble size follows transaction amount.</p>
        </div>
        <div className="flex gap-2">
          <Badge tone="green">Buy</Badge>
          <Badge tone="red">Sell</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[28rem]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
              <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(Number(value)).toLocaleDateString("de-CH", { month: "short", year: "2-digit" })
                }
                tickLine={false}
                type="number"
              />
              <YAxis
                dataKey="price"
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(Number(value), currency)}
                tickLine={false}
                width={92}
              />
              <ZAxis dataKey="amount" range={[70, 900]} domain={[0, maxAmount]} />
              <Tooltip content={<BubbleTooltip currency={currency} />} />
              <Line
                data={lineData}
                dataKey="price"
                dot={false}
                isAnimationActive={false}
                name="BTC price"
                stroke="#f59e0b"
                strokeWidth={2.5}
                type="monotone"
              />
              <Scatter data={buys} dataKey="price" fill="#22c55e" name="Buys" />
              <Scatter data={sells} dataKey="price" fill="#ef4444" name="Sells" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function BubbleTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ payload: Partial<BubblePoint>; name?: string; value?: number }>;
  currency: Currency;
}) {
  if (!active || !payload?.length) return null;
  const point = payload.find((item) => item.payload.amount)?.payload;
  if (!point?.amount || !point.timestamp) return null;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm shadow-2xl shadow-black/30">
      <p className="font-bold text-white">{point.type === "sell" ? "Sell" : "Buy"}</p>
      <p className="text-zinc-400">{new Date(point.timestamp).toLocaleDateString("de-CH")}</p>
      <p className="mt-1 text-zinc-200">{formatBtc(point.btc ?? 0)}</p>
      <p className="text-zinc-200">{formatCurrency(point.amount, currency)}</p>
      <p className="text-zinc-200">{formatCurrency(point.price ?? 0, currency)} / BTC</p>
      {point.note ? <p className="mt-1 max-w-56 text-zinc-400">{point.note}</p> : null}
    </div>
  );
}
