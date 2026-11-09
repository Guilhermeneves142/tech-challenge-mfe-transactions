"use client";

// Adapter de apresentação: React Query = estado de SERVIDOR (cache, paginação,
// invalidação). Regras ficam no domínio e nos casos de uso.
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { nextPageParam, type SaveTransactionInput } from "@/application/transactions";
import { repositories, useCases } from "@/di/container";
import { toTransactionQuery, type TransactionFilterState } from "@/domain";

const TRANSACTIONS_KEY_PREFIX = "transactions";
const SUMMARY_KEY_PREFIX = "transactions-summary";
export const CATEGORIES_QUERY_KEY = ["categories"] as const;

// A chave usa a query NORMALIZADA: " mercado " e "mercado" compartilham cache.
const transactionsKey = (filters: TransactionFilterState) =>
  [TRANSACTIONS_KEY_PREFIX, toTransactionQuery(filters)] as const;
const summaryKey = (filters: TransactionFilterState) =>
  [SUMMARY_KEY_PREFIX, toTransactionQuery(filters)] as const;

/** Lista com scroll infinito (cache por conjunto de filtros). */
export function useTransactionsInfinite(filters: TransactionFilterState) {
  return useInfiniteQuery({
    queryKey: transactionsKey(filters),
    queryFn: ({ pageParam }) => useCases.listTransactions(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => nextPageParam(lastPage, allPages),
  });
}

export function useTransactionsSummary(filters: TransactionFilterState) {
  return useQuery({
    queryKey: summaryKey(filters),
    queryFn: () => useCases.getTransactionsSummary(filters),
  });
}

/** Categorias: estado de servidor que quase nunca muda → cache "eterno". */
export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => repositories.transactions.listCategories(),
    staleTime: Infinity,
  });
}

function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY_PREFIX] });
    queryClient.invalidateQueries({ queryKey: [SUMMARY_KEY_PREFIX] });
  };
}

export function useSaveTransaction() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: (input: SaveTransactionInput) => useCases.saveTransaction(input),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions();
  return useMutation({
    mutationFn: (id: number) => useCases.deleteTransaction(id),
    onSuccess: invalidate,
  });
}
