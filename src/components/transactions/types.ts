import type { NewTransaction, Transaction, TransactionDraft, TransactionType } from "@/domain";

// Aliases mantidos para não quebrar quem já importa daqui.
export type TransactionFormType = TransactionType;
export type TransactionFormState = TransactionDraft;
export type CreateTransactionPayload = NewTransaction;

export type TransactionModalMode = "create" | "edit";

export interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: TransactionModalMode;
  initialData?: Partial<TransactionDraft>;
  transactionId?: number;
  onSuccess?: (transaction: Transaction) => void;
}
