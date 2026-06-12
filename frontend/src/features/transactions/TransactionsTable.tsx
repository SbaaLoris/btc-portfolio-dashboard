import { Download, Edit, FileUp, Plus, Trash2 } from "lucide-react";

import type { Transaction } from "../../api/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatBtc, formatCurrency } from "../../lib/format";

type TransactionsTableProps = {
  transactions: Transaction[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onExportCsv: () => void;
  onImportCsv: (file: File) => void;
  importing: boolean;
};

export function TransactionsTable({
  transactions,
  onAdd,
  onEdit,
  onDelete,
  onExportCsv,
  onImportCsv,
  importing,
}: TransactionsTableProps) {
  const fileInputId = "transactions-csv-import";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Transactions</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">{transactions.length} tracked BTC movements</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
          <Button variant="secondary" onClick={() => document.getElementById(fileInputId)?.click()} disabled={importing}>
            <FileUp className="h-4 w-4" />
            {importing ? "Importing..." : "Import CSV"}
          </Button>
          <Button variant="secondary" onClick={onExportCsv} disabled={transactions.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <input
            id={fileInputId}
            className="hidden"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onImportCsv(file);
            }}
          />
        </div>
      </CardHeader>
      {transactions.length === 0 ? (
        <CardContent>
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-10 text-center">
            <h3 className="font-bold text-zinc-950">No transactions yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Add your first BTC buy or import a CSV file.</p>
          </div>
        </CardContent>
      ) : (
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-zinc-950 text-left text-zinc-300">
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.08em]">Date</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.08em]">Type</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.08em]">BTC</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.08em]">Fiat</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.08em]">Fee</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-[0.08em]">Note</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.08em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="bg-white/50 transition hover:bg-amber-50/45">
                  <td className="px-5 py-4 font-medium text-zinc-700">
                    {new Date(transaction.transaction_date).toLocaleDateString("de-CH")}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={transaction.type === "buy" ? "green" : "red"}>{transaction.type}</Badge>
                  </td>
                  <td className="px-5 py-4 font-bold tabular-nums text-zinc-950">{formatBtc(transaction.btc_amount)}</td>
                  <td className="px-5 py-4 tabular-nums text-zinc-700">
                    {formatCurrency(transaction.fiat_amount, transaction.currency)}
                  </td>
                  <td className="px-5 py-4 tabular-nums text-zinc-700">
                    {formatCurrency(transaction.fee_amount, transaction.currency)}
                  </td>
                  <td className="max-w-60 truncate px-5 py-4 text-zinc-500">{transaction.note ?? "-"}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Button aria-label="Edit transaction" className="h-8 w-8 rounded-lg px-0" variant="ghost" onClick={() => onEdit(transaction)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button aria-label="Delete transaction" className="h-8 w-8 rounded-lg px-0" variant="ghost" onClick={() => onDelete(transaction)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      )}
    </Card>
  );
}
