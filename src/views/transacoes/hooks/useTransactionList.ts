"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  api,
  type Category,
  type Transaction,
  type TransactionSummary,
  type TransactionParams,
} from "@/lib/api";

const PAGE_SIZE = 10;

interface Filters {
  filterDescription: string;
  filterType: string;
  filterRange: DateRange | undefined;
}

interface UseTransactionListArgs extends Filters {
  onCategoriesLoaded: (categories: Category[]) => void;
}

// Monta os params da query a partir dos filtros ativos.
// Centralizado aqui para a primeira página e as páginas seguintes não divergirem.
function buildParams(
  page: number,
  { filterDescription, filterType, filterRange }: Filters
): TransactionParams {
  const params: TransactionParams = { _page: page, _limit: PAGE_SIZE };
  if (filterDescription) params.descriptionLike = filterDescription;
  if (filterType && filterType !== "all") {
    params.type = filterType as "credit" | "debit";
  }
  if (filterRange?.from) {
    params.dateGte = format(filterRange.from, "yyyy-MM-dd") + "T00:00:00.000Z";
  }
  if (filterRange?.to) {
    params.dateLte = format(filterRange.to, "yyyy-MM-dd") + "T23:59:59.999Z";
  }
  return params;
}

/**
 * Lista de transações com paginação por scroll infinito.
 * Refaz a busca quando os filtros mudam e expõe um `refetch` para os modais
 * chamarem após criar/editar/excluir.
 */
export function useTransactionList(args: UseTransactionListArgs) {
  const { filterDescription, filterType, filterRange } = args;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | undefined>();
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const loadingInitialRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Mantém o callback atual sem precisar entrar nas dependências do fetch.
  const onCategoriesRef = useRef(args.onCategoriesLoaded);
  useEffect(() => {
    onCategoriesRef.current = args.onCategoriesLoaded;
  });

  // Carga inicial: roda na montagem, quando os filtros mudam ou no refetch.
  useEffect(() => {
    const load = async () => {
      loadingInitialRef.current = true;
      setLoadingInitial(true);
      pageRef.current = 1;
      hasMoreRef.current = true;
      setHasMore(true);

      const params = buildParams(1, { filterDescription, filterType, filterRange });
      const [txs, sum, cats] = await Promise.all([
        api.getTransactions(params).catch(() => []),
        api.getTransactionsSummary(params).catch(() => undefined),
        api.getCategories().catch(() => []),
      ]);

      setTransactions(txs);
      setSummary(sum);
      onCategoriesRef.current(cats);
      hasMoreRef.current = txs.length === PAGE_SIZE;
      setHasMore(txs.length === PAGE_SIZE);
      loadingInitialRef.current = false;
      setLoadingInitial(false);
    };

    load();
  }, [filterDescription, filterType, filterRange, reloadToken]);

  const fetchMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current || loadingInitialRef.current) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const nextPage = pageRef.current + 1;
    const params = buildParams(nextPage, { filterDescription, filterType, filterRange });
    const txs = await api.getTransactions(params).catch(() => []);

    setTransactions((prev) => [...prev, ...txs]);
    pageRef.current = nextPage;
    hasMoreRef.current = txs.length === PAGE_SIZE;
    setHasMore(txs.length === PAGE_SIZE);
    loadingMoreRef.current = false;
    setLoadingMore(false);
  }, [filterDescription, filterType, filterRange]);

  // Observa o sentinel para carregar a próxima página ao chegar no fim.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMore();
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore, loadingInitial]);

  // Recarrega a lista do zero (filtros atuais). Usado pelos modais e pelo
  // evento global disparado após criar/editar/excluir.
  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("mfe:refresh", handler);
    return () => window.removeEventListener("mfe:refresh", handler);
  }, [refetch]);

  return {
    transactions,
    summary,
    loadingInitial,
    loadingMore,
    hasMore,
    sentinelRef,
    refetch,
  };
}
