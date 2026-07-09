import type { Transaction } from "@/lib/api";

export type TransactionFormType = "credit" | "debit";

export type TransactionModalMode = "create" | "edit";

export interface CreateTransactionPayload {
  description: string;
  amount: number;
  category: string;
  date: string;
  dateLabel: string;
  type: TransactionFormType;
  attachment: string;
  attachmentName?: string;
}

export interface TransactionFormState {
  description: string;
  amount: string;
  category: string;
  date: string;
  type: TransactionFormType;
  attachment?: string;
  attachmentName?: string;
}

export interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: TransactionModalMode;
  initialData?: Partial<TransactionFormState>;
  transactionId?: number;
  onSuccess?: (transaction: Transaction) => void;
}
