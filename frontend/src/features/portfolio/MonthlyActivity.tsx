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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <CardTitle>Monthly activity</CardTitle>
        <p className="text-sm text-zinc-500">Net fiat flow, BTC volume, and transaction count by month.</p>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500">
            Monthly activity appears after the first transaction.
          </div>
        ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((row) => {
            const percent = Math.max(7, (Math.abs(row.net_amount) / maxAmount) * 100);
            const positive = row.net_amount >= 0;
            return (
              <div key={row.month} className="rounded-2xl border border-zinc-200/80 bg-zinc-50/75 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-zinc-950">
                    {new Date(`${row.month}-01T00:00:00`).toLocaleDateString("de-CH", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="rounded-full bg-white px-2 py-1 text-xs font-bold text-zinc-500 shadow-sm">{row.transaction_count} tx</p>
                </div>
                <p className={`mt-3 text-lg font-black tabular-nums ${positive ? "text-emerald-700" : "text-red-700"}`}>
                  {formatCurrency(row.net_amount, currency)}
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-500">{formatBtc(row.btc_amount)}</p>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-200/80">
                  <div
                    className={positive ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-red-500"}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
