import type { Category, NewTransaction, Transaction, TransactionSummary } from "./transaction.entity";
import type { TransactionQuery } from "./transaction-filters";

/** Porta de persistência. Implementada na infra (HTTP). */
export interface TransactionRepository {
  list(query: TransactionQuery & { page: number; limit: number }): Promise<Transaction[]>;
  summary(query: TransactionQuery): Promise<TransactionSummary>;
  create(data: NewTransaction): Promise<Transaction>;
  update(id: number, data: Partial<NewTransaction>): Promise<Transaction>;
  remove(id: number): Promise<void>;
  listCategories(): Promise<Category[]>;
}
