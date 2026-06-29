"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedCallback } from "use-debounce";
import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "@vandrei/finance-ui";
import type { Transaction } from "@/lib/api";
import {
  DeleteTransactionModal,
  TransactionModal,
} from "@/components/transactions";
import type { TransactionFormState } from "../../components/transactions/types";
import { RootState } from "@/store";
import { addCategories } from "@/features/categories/categories";
import { downloadAttachment } from "@/lib/file";
import { useTransactionList } from "./hooks/useTransactionList";
import { buildTransactionColumns } from "./components/transactionColumns";
import { TransactionFilters } from "./components/TransactionFilters";
import { TransactionSummary } from "./components/TransactionSummary";

export function TransactionPageClient() {
  const dispatch = useDispatch();
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const [filterDescription, setFilterDescription] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRange, setFilterRange] = useState<DateRange | undefined>();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction>();
  const [editingTransaction, setEditingTransaction] =
    useState<Partial<TransactionFormState>>();
  const [editingId, setEditingId] = useState<number>();

  const {
    transactions,
    summary,
    loadingInitial,
    loadingMore,
    hasMore,
    sentinelRef,
    refetch,
  } = useTransactionList({
    filterDescription,
    filterType,
    filterRange,
    onCategoriesLoaded: (items) => dispatch(addCategories(items)),
  });

  const pushDescriptionDebounced = useDebouncedCallback(
    (value: string) => setFilterDescription(value),
    300
  );

  function handleTypeChange(value: string | null) {
    setFilterType(!value || value === "all" ? "" : value);
  }

  function handleEdit(row: Transaction) {
    setEditingId(row.id);
    setEditingTransaction({
      description: row.description,
      category: row.category,
      amount: Math.abs(row.amount).toString(),
      date: row.date.split("T")[0],
      type: row.amount < 0 ? "debit" : "credit",
      attachment: row.attachment,
      attachmentName: row.attachmentName,
    });
    setModalOpen(true);
  }

  function handleNewTransaction() {
    setEditingId(undefined);
    setEditingTransaction(undefined);
    setModalOpen(true);
  }

  function handleDelete(row: Transaction) {
    setDeletingTransaction(row);
    setDeleteModalOpen(true);
  }

  function handleDownloadAttachment(row: Transaction) {
    if (!row.attachment) return;
    downloadAttachment(row.attachment, row.attachmentName);
  }

  const columns = buildTransactionColumns({
    categories,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onDownload: handleDownloadAttachment,
  });

  return (
    <>
      <TransactionFilters
        filterType={filterType}
        filterRange={filterRange}
        onDescriptionChange={pushDescriptionDebounced}
        onTypeChange={handleTypeChange}
        onRangeChange={setFilterRange}
        onClearRange={() => setFilterRange(undefined)}
        onNewTransaction={handleNewTransaction}
      />

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
            {!hasMore && transactions.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Você chegou ao fim da listagem
              </p>
            )}
          </div>
        </>
      )}

      <TransactionModal
        key={editingId ?? "create"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={editingTransaction ? "edit" : "create"}
        initialData={editingTransaction}
        transactionId={editingId}
        onSuccess={refetch}
      />

      <DeleteTransactionModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        transaction={deletingTransaction}
        onSuccess={refetch}
      />
    </>
  );
}
