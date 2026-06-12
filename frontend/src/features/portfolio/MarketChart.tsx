import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MarketChartPoint, MarketPrice } from "../../api/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatCurrency, formatPercent } from "../../lib/format";

export function MarketChart({
  data,
  price,
  currency,
}: {
  data: MarketChartPoint[];
  price?: MarketPrice;
  currency: string;
}) {
  const chartData = data.map((point) => ({
    date: new Date(point.timestamp).toLocaleDateString("de-CH", { month: "short", day: "2-digit" }),
    price: point.price,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>BTC market</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            {price ? `${formatCurrency(price.price, currency)} (${formatPercent(price.change_24h)})` : "Loading price"}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 6, right: 6 }}>
              <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(Number(value), currency)}
                width={86}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
              <Line dataKey="price" type="monotone" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

