"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDebouncedCallback } from "use-debounce";

import { DeleteTransactionModal, TransactionModal } from "@/components/transactions";
import { api, type Category, type Transaction, type TransactionParams, type TransactionSummary } from "@/lib/api";
import { getCategoryIcon } from "@/lib/categoryIcons";
import {
  Badge,
  Button,
  Calendar,
  Card,
  DataTable,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vandrei/finance-ui";
import type { TransactionFormState } from "../../components/transactions/types";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function truncateText(text: string, limit: number) {
  return text.length <= limit ? text : text.slice(0, limit) + "...";
}

export function TransactionPageClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const loadingInitialRef = useRef(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 10;

  const [summary, setSummary] = useState<TransactionSummary | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);


  const [filterDescription, setFilterDescription] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRange, setFilterRange] = useState<DateRange | undefined>();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | undefined>();
  const [editingTransaction, setEditingTransaction] = useState<Partial<TransactionFormState> | undefined>();
  const [editingId, setEditingId] = useState<number | undefined>();

  const fetchData = useCallback(async () => {
    loadingInitialRef.current = true;
    setLoadingInitial(true);

    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);

    const params: TransactionParams = { _page: 1, _limit: PAGE_SIZE };
    if (filterDescription) params.descriptionLike = filterDescription;
    if (filterType && filterType !== "all") params.type = filterType as "credit" | "debit";
    if (filterRange?.from) params.dateGte = format(filterRange.from, "yyyy-MM-dd") + "T00:00:00.000Z";
    if (filterRange?.to) params.dateLte = format(filterRange.to, "yyyy-MM-dd") + "T23:59:59.999Z";

    const [txs, sum, cats] = await Promise.all([
      api.getTransactions(params).catch(() => []),
      api.getTransactionsSummary(params).catch(() => undefined),
      api.getCategories().catch(() => []),
    ]);

    setTransactions(txs);
    setSummary(sum);
    setCategories(cats);
    hasMoreRef.current = txs.length === PAGE_SIZE;
    setHasMore(txs.length === PAGE_SIZE);
    loadingInitialRef.current = false;
    setLoadingInitial(false);

  }, [filterDescription, filterType, filterRange]);

  const fetchMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current || loadingInitialRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const nextPage = pageRef.current + 1;
    const params: TransactionParams = { _page: nextPage, _limit: PAGE_SIZE };
    if (filterDescription) params.descriptionLike = filterDescription;
    if (filterType && filterType !== "all") params.type = filterType as "credit" | "debit";
    if (filterRange?.from) params.dateGte = format(filterRange.from, "yyyy-MM-dd") + "T00:00:00.000Z";
    if (filterRange?.to) params.dateLte = format(filterRange.to, "yyyy-MM-dd") + "T23:59:59.999Z";

    const txs = await api.getTransactions(params).catch(() => []);

    setTransactions((prev) => [...prev, ...txs]);
    pageRef.current = nextPage;
    hasMoreRef.current = txs.length === PAGE_SIZE;
    setHasMore(txs.length === PAGE_SIZE);
    loadingMoreRef.current = false;
    setLoadingMore(false);
  }, [filterDescription, filterType, filterRange]);

  // Intersection Observer para detectar fim da lista
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

  useEffect(() => { fetchData(); }, [fetchData]);

  // Escuta evento de refresh disparado por modais após criar/editar/deletar
  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener("mfe:refresh", handler);
    return () => window.removeEventListener("mfe:refresh", handler);
  }, [fetchData]);

  const pushDescriptionDebounced = useDebouncedCallback((v: string) => {
    setFilterDescription(v);
  }, 300);

  function handleDescriptionChange(value: string) {
    pushDescriptionDebounced(value);
  }

  function handleTypeChange(value: string | null) {
    setFilterType(!value || value === "all" ? "" : value);
  }

  function handleRangeChange(range: DateRange | undefined) {
    setFilterRange(range);
  }

  function handleClearRange() {
    setFilterRange(undefined);
  }

  function handleEdit(row: Transaction) {
    setEditingId(row.id);
    setEditingTransaction({
      description: row.description,
      category: row.category,
      amount: Math.abs(row.amount).toString(),
      date: row.date.split("T")[0],
      type: row.amount < 0 ? "debit" : "credit",
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

  function handleSuccess() {
    fetchData();
  }

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "id",
      accessorKey: "description",
      meta: { width: "40%" },
      header: () => <p className="text-label text-card-foreground">DESCRIÇÃO</p>,
      cell: ({ row }) => {
        const { dateLabel, description, amount } = row.original;
        const Icon = getCategoryIcon(categories, row.original.category);
        const formatted = `R$ ${Math.abs(amount).toFixed(2).replace(".", ",")}`;
        return (
          <>
            <div className="hidden sm:flex flex-row gap-4 items-center">
              <span className="p-2 rounded-full text-brand-primary bg-brand-secondary shrink-0">
                <Icon className="size-5" />
              </span>
              <div className="flex flex-col">
                <h6>{description}</h6>
                <p className="text-caption text-(--color-text-tertiary)">{dateLabel}</p>
              </div>
            </div>
            <div className="flex sm:hidden flex-row items-center gap-3">
              <span className="p-2 rounded-full text-brand-primary bg-brand-secondary shrink-0">
                <Icon className="size-5" />
              </span>
              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <h6>{truncateText(description, 20)}</h6>
                <p className="text-caption text-(--color-text-tertiary)">{dateLabel}</p>
                <span className={`text-sm font-medium ${amount < 0 ? "text-feedback-error" : "text-primary"}`}>
                  {amount < 0 ? `- ${formatted}` : `+ ${formatted}`}
                </span>
              </div>
            </div>
          </>
        );
      },
    },
    {
      accessorKey: "category",
      meta: { width: "25%" },
      header: () => <p className="text-label text-card-foreground hidden sm:block">CATEGORIA</p>,
      cell: ({ row }) => {
        const id = row.getValue("category") as string;
        const label = categories.find((c) => c.id === id)?.label ?? id;
        return <Badge className="hidden sm:inline-flex" variant="outline">{label}</Badge>;
      },
    },
    {
      accessorKey: "amount",
      meta: { width: "20%" },
      header: () => <p className="text-label text-card-foreground hidden sm:block text-right">VALOR</p>,
      cell: ({ row }) => {
        const amount = row.original.amount;
        const formatted = `R$ ${Math.abs(amount).toFixed(2).replace(".", ",")}`;
        return amount < 0
          ? <h6 className="text-feedback-error text-right hidden sm:block">- {formatted}</h6>
          : <h6 className="text-primary text-right hidden sm:block">+ {formatted}</h6>;
      },
    },
    {
      id: "actions",
      meta: { width: 120 },
      header: () => <p className="text-label text-card-foreground w-full text-right">AÇÕES</p>,
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="icon" aria-label={`Editar transação: ${row.original.description}`} onClick={() => handleEdit(row.original)}>
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Excluir transação: ${row.original.description}`} onClick={() => handleDelete(row.original)}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className="flex flex-col sm:flex-row items-end gap-5 py-6 px-6 flex-wrap">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <Label className="text-label">Período</Label>
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger render={<Button variant="outline" className="w-full sm:w-56 h-8 justify-start gap-2 font-normal !border-primary" />}>
                <CalendarIcon className="size-4 text-muted-foreground" />
                {filterRange?.from ? (
                  filterRange.to
                    ? `${format(filterRange.from, "dd/MM/yyyy")} - ${format(filterRange.to, "dd/MM/yyyy")}`
                    : format(filterRange.from, "dd/MM/yyyy")
                ) : (
                  <span className="text-muted-foreground">dd/mm/aaaa - dd/mm/aaaa</span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" locale={ptBR} selected={filterRange} onSelect={handleRangeChange} numberOfMonths={2} />
              </PopoverContent>
            </Popover>
            {filterRange && (
              <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={handleClearRange}>
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full sm:flex-1">
          <Label className="text-label">Buscar</Label>
          <Input
            type="search"
            placeholder="Descrição"
            className="w-full min-w-24"
            onChange={(e) => handleDescriptionChange(e.target.value)}
            icon={<Search className="size-4 text-primary" />}
            iconSide="left"
          />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-48">
          <Label className="text-label">Tipo</Label>
          <Select value={filterType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Todos os tipos">
                {(v) => v === "credit" ? "Receita" : v === "debit" ? "Despesa" : "Todos os tipos"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent side="bottom" className="p-1" sideOffset={6} align="start" alignItemWithTrigger={false}>
              <SelectItem className="cursor-pointer" value="all">Todos os tipos</SelectItem>
              <SelectItem className="cursor-pointer" value="credit">Receita</SelectItem>
              <SelectItem className="cursor-pointer" value="debit">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="default" className="cursor-pointer w-full sm:w-auto shrink-0" onClick={handleNewTransaction}>
          <Plus size={16} />
          Nova Transação
        </Button>
      </Card>

      <section className="grid grid-cols-1 sm:mx-10 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-10 my-6">
        <Card className="p-6 bg-brand-secondary text-primary">
          <h4>Receitas</h4>
          <h2 className="pe-4 -mt-3">{formatCurrency(summary?.income ?? 0)}</h2>
        </Card>
        <Card className="p-6 bg-feedback-error text-card">
          <h4>Despesas</h4>
          <h2 className="pe-4 -mt-3">{formatCurrency(summary?.expense ?? 0)}</h2>
        </Card>
        <Card className="p-6 bg-brand-tertiary text-card sm:col-span-2 xl:col-span-1">
          <h4>Seu Saldo Atual</h4>
          <h2 className="pe-4 -mt-3">{formatCurrency(summary?.currentBalance ?? 0)}</h2>
        </Card>
      </section>

      {loadingInitial ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <DataTable columns={columns} data={transactions} infiniteScroll />

          {/* Sentinel + feedback de carregamento */}
          <div ref={sentinelRef} className="py-4 flex justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando mais...</span>
              </div>
            )}
            {!hasMore && transactions.length > 0 && (
              <p className="text-sm text-muted-foreground">Você chegou ao fim da listagem</p>
            )}
          </div>
        </>

      )}

      <TransactionModal
        key={editingId ?? "create"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
        mode={editingTransaction ? "edit" : "create"}
        initialData={editingTransaction}
        transactionId={editingId}
        onSuccess={handleSuccess}
      />

      <DeleteTransactionModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        transaction={deletingTransaction}
        onSuccess={handleSuccess}
      />
    </>
  );
}
