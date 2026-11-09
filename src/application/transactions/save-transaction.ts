import {
  toNewTransaction,
  type Transaction,
  type TransactionDraft,
  type TransactionRepository,
} from "@/domain";

export interface SaveTransactionInput {
  draft: TransactionDraft;
  /** Presente → edição; ausente → criação. */
  id?: number;
}

 // Caso de uso: criar/editar transação.
 
export function makeSaveTransaction(
  repository: TransactionRepository,
  clock: () => Date = () => new Date()
) {
  return async function saveTransaction({ draft, id }: SaveTransactionInput): Promise<Transaction> {
    const data = toNewTransaction(draft, clock());
    return id ? repository.update(id, data) : repository.create(data);
  };
}
