import { Edit, Plus, Trash2 } from "lucide-react";

import type { Transaction } from "../../api/types";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { EmptyState } from "../../components/ui/empty-state";
import { formatBtc, formatCurrency } from "../../lib/format";

type TransactionsTableProps = {
  transactions: Transaction[];
  onAdd: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export function TransactionsTable({ transactions, onAdd, onEdit, onDelete }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return <EmptyState title="No transactions yet" message="Add your first BTC buy or sell to populate the dashboard." />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Transactions</CardTitle>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
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
    </Card>
  );
}

