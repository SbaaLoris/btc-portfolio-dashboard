import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PortfolioHistoryPoint } from "../../api/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatCurrency } from "../../lib/format";

export function PortfolioChart({
  data,
  currency,
}: {
  data: PortfolioHistoryPoint[];
  currency: string;
}) {
  const chartData = data.map((point) => ({
    date: new Date(point.timestamp).toLocaleDateString("de-CH", { month: "short", day: "2-digit" }),
    value: point.value,
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Portfolio value</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 6, right: 6 }}>
              <defs>
                <linearGradient id="portfolioValue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71717a", fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(Number(value), currency)}
                width={86}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{
                  border: "1px solid #e4e4e7",
                  borderRadius: 12,
                  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
                }}
              />
              <Area dataKey="value" stroke="#d97706" fill="url(#portfolioValue)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
