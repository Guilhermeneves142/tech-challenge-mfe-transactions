"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Download, Pencil, Trash2 } from "lucide-react";
import { Badge, Button } from "@vandrei/finance-ui";
import type { Category, Transaction } from "@/lib/api";
import { getCategoryIcon } from "@/lib/categoryIcons";

function truncateText(text: string, limit: number) {
  return text.length <= limit ? text : text.slice(0, limit) + "...";
}

// Valor com sinal e cor: despesas em vermelho, receitas em verde da marca.
function formatSigned(amount: number) {
  const value = `R$ ${Math.abs(amount).toFixed(2).replace(".", ",")}`;
  return {
    text: amount < 0 ? `- ${value}` : `+ ${value}`,
    colorClass: amount < 0 ? "text-feedback-error" : "text-primary",
  };
}

interface ColumnHandlers {
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onDownload: (transaction: Transaction) => void;
}

export function buildTransactionColumns({
  categories,
  onEdit,
  onDelete,
  onDownload,
}: ColumnHandlers): ColumnDef<Transaction>[] {
  return [
    {
      id: "id",
      accessorKey: "description",
      meta: { width: "40%" },
      header: () => <p className="text-label text-card-foreground">DESCRIÇÃO</p>,
      cell: ({ row }) => {
        const { dateLabel, description, amount } = row.original;
        const Icon = getCategoryIcon(categories, row.original.category);
        const { text, colorClass } = formatSigned(amount);
        return (
          <>
            <div className="hidden sm:flex flex-row gap-4 items-center">
              <span className="p-2 rounded-full text-brand-primary bg-brand-secondary shrink-0">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col">
                <h6>{description}</h6>
                <p className="text-caption text-(--color-text-tertiary)">
                  {dateLabel}
                </p>
              </div>
            </div>
            <div className="flex sm:hidden flex-row items-center gap-3">
              <span className="p-2 rounded-full text-brand-primary bg-brand-secondary shrink-0">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <h6>{truncateText(description, 20)}</h6>
                <p className="text-caption text-(--color-text-tertiary)">
                  {dateLabel}
                </p>
                <span className={`text-sm font-medium ${colorClass}`}>{text}</span>
              </div>
            </div>
          </>
        );
      },
    },
    {
      accessorKey: "category",
      meta: { width: "25%" },
      header: () => (
        <p className="text-label text-card-foreground hidden sm:block">CATEGORIA</p>
      ),
      cell: ({ row }) => {
        const id = row.getValue("category") as string;
        const label = categories.find((c) => c.id === id)?.label ?? id;
        return (
          <Badge className="hidden sm:inline-flex" variant="outline">
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      meta: { width: "20%" },
      header: () => (
        <p className="text-label text-card-foreground hidden sm:block text-right">
          VALOR
        </p>
      ),
      cell: ({ row }) => {
        const { text, colorClass } = formatSigned(row.original.amount);
        return <h6 className={`${colorClass} text-right hidden sm:block`}>{text}</h6>;
      },
    },
    {
      id: "actions",
      meta: { width: 120 },
      header: () => (
        <p className="text-label text-card-foreground w-full text-right">AÇÕES</p>
      ),
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end items-center">
          {row.original.attachment && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Baixar anexo da transação: ${row.original.description}`}
              onClick={() => onDownload(row.original)}
            >
              <Download className="size-4" aria-hidden />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Editar transação: ${row.original.description}`}
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Excluir transação: ${row.original.description}`}
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];
}
