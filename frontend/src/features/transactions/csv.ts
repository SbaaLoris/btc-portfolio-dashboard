import type { Currency, Transaction, TransactionPayload, TransactionType } from "../../api/types";

const EXPORT_HEADERS = [
  "transaction_date",
  "type",
  "btc_amount",
  "fiat_amount",
  "currency",
  "fee_amount",
  "note",
];

export function transactionsToCsv(transactions: Transaction[]) {
  const rows = transactions.map((transaction) => [
    transaction.transaction_date,
    transaction.type,
    transaction.btc_amount,
    transaction.fiat_amount,
    transaction.currency,
    transaction.fee_amount,
    transaction.note ?? "",
  ]);

  return [EXPORT_HEADERS, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function parseTransactionsCsv(csv: string): TransactionPayload[] {
  const rows = parseCsvRows(csv).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) {
    throw new Error("CSV must contain a header row and at least one transaction row.");
  }

  const headers = rows[0].map((header) => normalizeHeader(header));
  return rows.slice(1).map((row, index) => {
    const record = Object.fromEntries(headers.map((header, columnIndex) => [header, row[columnIndex]?.trim() ?? ""]));
    return normalizeTransactionRecord(record, index + 2);
  });
}

export function downloadTransactionsCsv(transactions: Transaction[]) {
  const blob = new Blob([transactionsToCsv(transactions)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `btc-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function normalizeTransactionRecord(record: Record<string, string>, rowNumber: number): TransactionPayload {
  const type = normalizeType(read(record, ["type", "typ"], rowNumber)) as TransactionType;
  const btcAmount = parsePositiveNumber(read(record, ["btc_amount", "btc", "btc menge"], rowNumber), "BTC amount", rowNumber);
  const fiatAmount = parsePositiveNumber(
    read(record, ["fiat_amount", "chf", "amount", "betrag", "betrag in chf"], rowNumber),
    "Fiat amount",
    rowNumber,
  );
  const currency = normalizeCurrency(record.currency || record.waehrung || record.wahrung || "CHF");
  const feeAmount = parseNonNegativeNumber(record.fee_amount || record.fee || record.fees || "0", "Fee", rowNumber);
  const rawDate = read(record, ["transaction_date", "date", "datum"], rowNumber);

  return {
    type,
    btc_amount: btcAmount,
    fiat_amount: fiatAmount,
    currency,
    fee_amount: feeAmount,
    transaction_date: normalizeDate(rawDate, rowNumber),
    note: record.note || record.notiz || null,
  };
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function csvEscape(value: string | number) {
  const text = String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
}

function read(record: Record<string, string>, keys: string[], rowNumber: number) {
  for (const key of keys) {
    const value = record[normalizeHeader(key)];
    if (value) return value;
  }
  throw new Error(`Row ${rowNumber}: missing ${keys[0]}.`);
}

function normalizeType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "buy" || normalized === "kauf") return "buy";
  if (normalized === "sell" || normalized === "verkauf") return "sell";
  throw new Error(`Unsupported transaction type: ${value}. Use buy/sell.`);
}

function normalizeCurrency(value: string): Currency {
  const normalized = value.trim().toUpperCase();
  if (normalized === "CHF" || normalized === "USD" || normalized === "EUR") return normalized;
  throw new Error(`Unsupported currency: ${value}. Use CHF, USD, or EUR.`);
}

function parsePositiveNumber(value: string, label: string, rowNumber: number) {
  const number = Number(value.replace("'", "").replace(",", "."));
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`Row ${rowNumber}: ${label} must be greater than 0.`);
  }
  return number;
}

function parseNonNegativeNumber(value: string, label: string, rowNumber: number) {
  const number = Number(value.replace("'", "").replace(",", "."));
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`Row ${rowNumber}: ${label} must be 0 or greater.`);
  }
  return number;
}

function normalizeDate(value: string, rowNumber: number) {
  const trimmed = value.trim();
  const isoLike = trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00Z`;
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Row ${rowNumber}: invalid date.`);
  }
  return date.toISOString();
}

