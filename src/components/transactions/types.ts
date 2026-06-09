import type { Category, Transaction } from "@/lib/api";

export type TransactionFormType = "credit" | "debit";

export type TransactionModalMode = "create" | "edit";

export interface CreateTransactionPayload {
  description: string;
  amount: number;
  category: string;
  date: string;
  dateLabel: string;
  type: TransactionFormType;
}

export interface TransactionFormState {
  description: string;
  amount: string;
  category: string;
  date: string;
  type: TransactionFormType;
}

export interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  mode?: TransactionModalMode;
  initialData?: Partial<TransactionFormState>;
  transactionId?: number;
  onSuccess?: (transaction: Transaction) => void;
}
