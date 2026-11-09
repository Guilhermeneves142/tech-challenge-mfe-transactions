// ─────────────────────────────────────────────
//  Domínio · Transações
//  Entidades puras: sem React, sem Redux, sem fetch.
// ─────────────────────────────────────────────

export type TransactionType = "credit" | "debit";

export interface Transaction {
  id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  dateLabel: string;
  type: TransactionType;
  attachment: string;
  attachmentName?: string;
}

export type NewTransaction = Omit<Transaction, "id">;

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  currentBalance: number;
  future: number;
}
