import {
  toTransactionQuery,
  type Transaction,
  type TransactionFilterState,
  type TransactionRepository,
  type TransactionSummary,
} from "@/domain";

export const PAGE_SIZE = 10;

/** Caso de uso: uma página da listagem, a partir do estado dos filtros. */
export function makeListTransactions(repository: TransactionRepository, pageSize = PAGE_SIZE) {
  return function listTransactions(filters: TransactionFilterState, page: number): Promise<Transaction[]> {
    return repository.list({ ...toTransactionQuery(filters), page, limit: pageSize });
  };
}

/** Próxima página existe se a última veio cheia. */
export function nextPageParam(lastPage: unknown[], allPages: unknown[], pageSize = PAGE_SIZE) {
  return lastPage.length === pageSize ? allPages.length + 1 : undefined;
}

export function makeGetTransactionsSummary(repository: TransactionRepository) {
  return function getTransactionsSummary(filters: TransactionFilterState): Promise<TransactionSummary> {
    return repository.summary(toTransactionQuery(filters));
  };
}
