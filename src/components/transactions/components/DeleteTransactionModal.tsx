"use client";



import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Button,
} from "@vandrei/finance-ui";
import { api } from "@/lib/api";
import type { Transaction } from "@/lib/api";

export interface DeleteTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  onSuccess?: (id: number) => void;
}

export function DeleteTransactionModal({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: DeleteTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!transaction) return;
    setError(null);
    setLoading(true);
    try {
      await api.deleteTransaction(transaction.id);
      onSuccess?.(transaction.id);
      onOpenChange(false);
    } catch {
      setError("Não foi possível remover a transação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const amount = transaction?.amount ?? 0;
  const formatted = `R$ ${Math.abs(amount).toFixed(2).replace(".", ",")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-6 gap-0" showCloseButton>
        <DialogHeader className="mb-2">
          <DialogTitle>Remover Transação</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 my-2">
          <p className="text-base leading-relaxed text-card-foreground">
            Tem certeza que deseja remover essa transação?
          </p>

          {transaction && (
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-full flex items-center justify-center text-brand-primary bg-brand-secondary">
                  <ShoppingBag size={20} />
                </span>
                <h6>{transaction.description}</h6>
              </div>
              <h6 className={amount < 0 ? "text-feedback-error" : "text-primary"}>
                {amount < 0 ? "- " : "+ "}
                {formatted}
              </h6>
            </div>
          )}

          {error && <p className="text-caption text-feedback-error">{error}</p>}
        </div>

        <DialogFooter className="mt-4 bg-white border-none">
          <DialogClose
            render={<Button variant="outline" disabled={loading} />}
          >
            Cancelar
          </DialogClose>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-feedback-error text-white hover:bg-feedback-error/90"
          >
            {loading ? "Removendo..." : "Remover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
