"use client";

import { useEffect, useMemo, useRef } from "react";
import { DataTable } from "@vandrei/finance-ui";
import type { Transaction } from "@/domain";
import {
  DeleteTransactionModal,
  TransactionModal,
} from "@/components/transactions";
import { downloadAttachment } from "@/infra/browser/file";
import {
  useCategories,
  useTransactionsInfinite,
  useTransactionsSummary,
} from "@/lib/queries/transactions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDeletion,
  selectEditor,
  selectEditorDraft,
  selectFilters,
} from "@/store/selectors";
import {
  deleteRequested,
  deletionClosed,
  editorClosed,
  editRequested,
} from "@/store/slices/transactionsUi.slice";
import { buildTransactionColumns } from "./components/transactionColumns";
import { TransactionFilters } from "./components/TransactionFilters";
import { TransactionSummary } from "./components/TransactionSummary";

export function TransactionPageClient() {
  const dispatch = useAppDispatch();

  // Estado de UI (Redux)
  const filters = useAppSelector(selectFilters);
  const editor = useAppSelector(selectEditor);
  const editorDraft = useAppSelector(selectEditorDraft);
  const deletion = useAppSelector(selectDeletion);

  // Estado de servidor (React Query)
  const {
    data: transactionsPages,
    isLoading: loadingInitial,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
  } = useTransactionsInfinite(filters);
  const { data: summary } = useTransactionsSummary(filters);
  const { data: categories = [] } = useCategories();

  const transactions = useMemo(
    () => transactionsPages?.pages.flat() ?? [],
    [transactionsPages]
  );

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, loadingMore]);

  function handleDownloadAttachment(row: Transaction) {
    if (!row.attachment) return;
    downloadAttachment(row.attachment, row.attachmentName);
  }

  const columns = buildTransactionColumns({
    categories,
    onEdit: (row) => dispatch(editRequested(row)),
    onDelete: (row) => dispatch(deleteRequested(row)),
    onDownload: handleDownloadAttachment,
  });

  const editingId = editor.transaction?.id;

  return (
    <>
      <TransactionFilters />

      <TransactionSummary summary={summary} />

      {loadingInitial ? (
        <div className="flex justify-center py-12" aria-busy="true">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="sr-only">Carregando transações</span>
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={transactions} infiniteScroll />

          {/* Sentinel + feedback de carregamento das próximas páginas */}
          <div ref={sentinelRef} className="py-4 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2" aria-live="polite">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Carregando mais...
                </span>
              </div>
            )}
            {!hasNextPage && transactions.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Você chegou ao fim da listagem
              </p>
            )}
          </div>
        </>
      )}

      <TransactionModal
        key={editingId ?? "create"}
        open={editor.open}
        onOpenChange={(open) => !open && dispatch(editorClosed())}
        mode={editorDraft ? "edit" : "create"}
        initialData={editorDraft}
        transactionId={editingId}
      />

      <DeleteTransactionModal
        open={deletion.open}
        onOpenChange={(open) => !open && dispatch(deletionClosed())}
        transaction={deletion.transaction}
      />
    </>
  );
}
