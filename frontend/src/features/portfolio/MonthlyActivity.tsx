import type { Currency, MonthlyActivity as MonthlyActivityRow } from "../../api/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatBtc, formatCurrency } from "../../lib/format";

export function MonthlyActivity({
  rows,
  currency,
}: {
  rows: MonthlyActivityRow[];
  currency: Currency;
}) {
  const maxAmount = Math.max(...rows.map((row) => Math.abs(row.net_amount)), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((row) => {
            const percent = Math.max(7, (Math.abs(row.net_amount) / maxAmount) * 100);
            const positive = row.net_amount >= 0;
            return (
              <div key={row.month} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-950">
                    {new Date(`${row.month}-01T00:00:00`).toLocaleDateString("de-CH", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-zinc-500">{row.transaction_count} tx</p>
                </div>
                <p className={`mt-2 text-base font-semibold ${positive ? "text-emerald-700" : "text-red-700"}`}>
                  {formatCurrency(row.net_amount, currency)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{formatBtc(row.btc_amount)}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className={positive ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-red-500"}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

