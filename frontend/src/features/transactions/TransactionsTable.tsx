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
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle>Transactions</CardTitle>
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
          <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <h3 className="font-semibold text-zinc-950">No transactions yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Add your first BTC buy or import a CSV file.</p>
          </div>
        </CardContent>
      ) : (
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">BTC</th>
              <th className="px-5 py-3 font-medium">Fiat</th>
              <th className="px-5 py-3 font-medium">Fee</th>
              <th className="px-5 py-3 font-medium">Note</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t border-zinc-100">
                <td className="px-5 py-3 text-zinc-700">
                  {new Date(transaction.transaction_date).toLocaleDateString("de-CH")}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={transaction.type === "buy" ? "green" : "red"}>{transaction.type}</Badge>
                </td>
                <td className="px-5 py-3 font-medium text-zinc-950">{formatBtc(transaction.btc_amount)}</td>
                <td className="px-5 py-3 text-zinc-700">
                  {formatCurrency(transaction.fiat_amount, transaction.currency)}
                </td>
                <td className="px-5 py-3 text-zinc-700">
                  {formatCurrency(transaction.fee_amount, transaction.currency)}
                </td>
                <td className="max-w-60 truncate px-5 py-3 text-zinc-500">{transaction.note ?? "-"}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Button aria-label="Edit transaction" className="h-8 w-8 px-0" variant="ghost" onClick={() => onEdit(transaction)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button aria-label="Delete transaction" className="h-8 w-8 px-0" variant="ghost" onClick={() => onDelete(transaction)}>
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
