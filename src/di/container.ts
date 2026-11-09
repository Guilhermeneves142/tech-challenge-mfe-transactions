// Composition root: liga casos de uso às implementações concretas (infra).
import {
  makeDeleteTransaction,
  makeGetTransactionsSummary,
  makeListTransactions,
  makeSaveTransaction,
} from "@/application/transactions";
import { httpTransactionRepository } from "@/infra/repositories/transaction.http-repository";

export const repositories = {
  transactions: httpTransactionRepository,
};

export const useCases = {
  listTransactions: makeListTransactions(repositories.transactions),
  getTransactionsSummary: makeGetTransactionsSummary(repositories.transactions),
  saveTransaction: makeSaveTransaction(repositories.transactions),
  deleteTransaction: makeDeleteTransaction(repositories.transactions),
};
