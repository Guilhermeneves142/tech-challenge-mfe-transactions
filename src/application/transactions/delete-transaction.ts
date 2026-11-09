import type { TransactionRepository } from "@/domain";

export function makeDeleteTransaction(repository: TransactionRepository) {
  return async function deleteTransaction(id: number): Promise<void> {
    await repository.remove(id);
  };
}
