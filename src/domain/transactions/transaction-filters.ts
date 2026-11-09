import type { TransactionType } from "./transaction.entity";

// ─────────────────────────────────────────────
//  Filtros da listagem.
//  `TransactionFilterState` = o que a UI guarda (serializável → cabe no Redux).
//  `TransactionQuery`       = o que a API entende.
// ─────────────────────────────────────────────

export type TransactionTypeFilter = TransactionType | "all";

export interface TransactionFilterState {
  description: string;
  type: TransactionTypeFilter;
  from?: string;
  to?: string;
}

export const EMPTY_FILTERS: TransactionFilterState = {
  description: "",
  type: "all",
};

export interface TransactionQuery {
  descriptionLike?: string;
  type?: TransactionType;
  dateGte?: string;
  dateLte?: string;
}

/** Converte o estado dos filtros na query da API (início/fim do dia em UTC). */
export function toTransactionQuery(filters: TransactionFilterState): TransactionQuery {
  const query: TransactionQuery = {};
  const description = filters.description.trim();
  if (description) query.descriptionLike = description;
  if (filters.type !== "all") query.type = filters.type;
  if (filters.from) query.dateGte = `${filters.from}T00:00:00.000Z`;
  if (filters.to) query.dateLte = `${filters.to}T23:59:59.999Z`;
  return query;
}

export function hasActiveFilters(filters: TransactionFilterState): boolean {
  return Object.keys(toTransactionQuery(filters)).length > 0;
}
