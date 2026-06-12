import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["buy", "sell"]),
  btc_amount: z.coerce.number().positive(),
  fiat_amount: z.coerce.number().positive(),
  currency: z.enum(["CHF", "USD", "EUR"]),
  fee_amount: z.coerce.number().min(0),
  transaction_date: z.string().min(1),
  note: z.string().max(500).optional(),
});

export type TransactionFormInput = z.input<typeof transactionSchema>;
export type TransactionFormValues = z.output<typeof transactionSchema>;
