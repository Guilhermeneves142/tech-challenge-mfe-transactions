import type { TransactionRepository } from "@/domain";
import { api } from "@/infra/http/finance-api";

/** Adapter: implementa a porta do domínio usando a API HTTP (/api do host). */
export const httpTransactionRepository: TransactionRepository = {
  list: ({ page, limit, ...query }) => api.getTransactions({ ...query, _page: page, _limit: limit }),
  summary: (query) => api.getTransactionsSummary(query),
  create: (data) => api.createTransaction(data),
  update: (id, data) => api.updateTransaction(id, data),
  remove: (id) => api.deleteTransaction(id),
  listCategories: () => api.getCategories(),
};
