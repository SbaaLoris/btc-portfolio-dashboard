import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { Transaction, TransactionPayload } from "../../api/types";
import { Button } from "../../components/ui/button";
import { Dialog } from "../../components/ui/dialog";
import { FieldError, Input, Label, Select, Textarea } from "../../components/ui/form";
import { fromDateTimeInputValue, toDateTimeInputValue } from "../../lib/format";
import { transactionSchema, type TransactionFormInput, type TransactionFormValues } from "./transactionSchema";

type TransactionDialogProps = {
  open: boolean;
  transaction?: Transaction | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TransactionPayload) => void;
};

export function TransactionDialog({ open, transaction, submitting, onClose, onSubmit }: TransactionDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    values: {
      type: transaction?.type ?? "buy",
      btc_amount: transaction?.btc_amount ?? 0.01,
      fiat_amount: transaction?.fiat_amount ?? 1000,
      currency: transaction?.currency ?? "CHF",
      fee_amount: transaction?.fee_amount ?? 0,
      transaction_date: transaction
        ? toDateTimeInputValue(transaction.transaction_date)
        : toDateTimeInputValue(new Date().toISOString()),
      note: transaction?.note ?? "",
    },
  });

  function submit(values: TransactionFormValues) {
    onSubmit({
      ...values,
      transaction_date: fromDateTimeInputValue(values.transaction_date),
      note: values.note?.trim() ? values.note.trim() : null,
    });
  }

  function close() {
    reset();
    onClose();
  }

  return (
    <Dialog open={open} title={transaction ? "Edit transaction" : "Add transaction"} onClose={close}>
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select id="type" {...register("type")}>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </Select>
            <FieldError message={errors.type?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Select id="currency" {...register("currency")}>
              <option value="CHF">CHF</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>
            <FieldError message={errors.currency?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="btc_amount">BTC amount</Label>
            <Input id="btc_amount" step="0.00000001" type="number" {...register("btc_amount")} />
            <FieldError message={errors.btc_amount?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fiat_amount">Fiat amount</Label>
            <Input id="fiat_amount" step="0.01" type="number" {...register("fiat_amount")} />
            <FieldError message={errors.fiat_amount?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fee_amount">Fee</Label>
            <Input id="fee_amount" step="0.01" type="number" {...register("fee_amount")} />
            <FieldError message={errors.fee_amount?.message} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transaction_date">Date</Label>
            <Input id="transaction_date" type="datetime-local" {...register("transaction_date")} />
            <FieldError message={errors.transaction_date?.message} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="note">Note</Label>
          <Textarea id="note" {...register("note")} />
          <FieldError message={errors.note?.message} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
