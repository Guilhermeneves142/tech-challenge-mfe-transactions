"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Transaction, TransactionParams } from "@/lib/api";

export const PAGE_SIZE = 10;

export type TransactionFilters = Omit<TransactionParams, "_page" | "_limit">;

const TRANSACTIONS_KEY_PREFIX = "transactions";
const SUMMARY_KEY_PREFIX = "transactions-summary";
export const CATEGORIES_QUERY_KEY = ["categories"] as const;

function transactionsKey(filters: TransactionFilters) {
  return [TRANSACTIONS_KEY_PREFIX, filters] as const;
}

function summaryKey(filters: TransactionFilters) {
  return [SUMMARY_KEY_PREFIX, filters] as const;
}

/** Lista de transações com paginação por scroll infinito (cache por conjunto de filtros). */
export function useTransactionsInfinite(filters: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: transactionsKey(filters),
    queryFn: ({ pageParam }) =>
      api.getTransactions({ ...filters, _page: pageParam, _limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });
}

export function useTransactionsSummary(filters: TransactionFilters) {
  return useQuery({
    queryKey: summaryKey(filters),
    queryFn: () => api.getTransactionsSummary(filters),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: api.getCategories,
  });
}

function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY_PREFIX] });
    queryClient.invalidateQueries({ queryKey: [SUMMARY_KEY_PREFIX] });
  };
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactions();

  return useMutation({
    mutationFn: (body: Omit<Transaction, "id">) => api.createTransaction(body),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Partial<Omit<Transaction, "id">>;
    }) => api.updateTransaction(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions();

  return useMutation({
    mutationFn: (id: number) => api.deleteTransaction(id),
    onSuccess: invalidate,
  });
}
