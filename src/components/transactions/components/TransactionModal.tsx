"use client";



import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Button,
  Input,
  Label,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@vandrei/finance-ui";
import type { TransactionFormType, TransactionModalProps } from "@/components/transactions/types";
import { useTransactionForm } from "@/components/transactions/hooks/useTransactionForm";

export function TransactionModal({
  open,
  onOpenChange,
  categories,
  mode = "create",
  initialData,
  transactionId,
  onSuccess,
}: TransactionModalProps) {
  const {
    form,
    loading,
    error,
    setField,
    setType,
    handleSubmit,
    handleCancel,
    reset,
  } = useTransactionForm({
    mode,
    transactionId,
    initialData,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) reset(); onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-[480px] p-6 gap-0" showCloseButton>
        <DialogHeader className="mb-4">
          <DialogTitle>
            {mode === "edit" ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
        </DialogHeader>

        <form
          id="transaction-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 my-4"
        >
          <Tabs value={form.type} onValueChange={(v) => setType(v as TransactionFormType)}>
            <TabsList className="w-full bg-brand-primary rounded-[10px] !h-[35px]">
              <TabsTrigger
                value="credit"
                className="flex-1 !h-[29px] rounded-[10px] py-1 px-2 cursor-pointer text-white hover:text-white hover:bg-white/10 data-active:bg-brand-secondary data-active:text-brand-primary data-active:shadow-sm data-active:hover:brightness-95 data-active:hover:bg-brand-secondary"
              >
                Receita
              </TabsTrigger>
              <TabsTrigger
                value="debit"
                className="flex-1 !h-[29px] rounded-[10px] py-1 px-2 cursor-pointer text-white hover:text-white hover:bg-white/10 data-active:bg-brand-secondary data-active:text-brand-primary data-active:shadow-sm data-active:hover:brightness-95 data-active:hover:bg-brand-secondary"
              >
                Despesa
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tx-description" className="text-label">
              Descrição
            </Label>
            <Input
              id="tx-description"
              placeholder="Descrição da transação"
              className="rounded-lg"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tx-amount" className="text-label">
              Valor
            </Label>
            <Input
              id="tx-amount"
              placeholder="Valor da transação"
              inputMode="decimal"
              className="rounded-lg"
              value={form.amount}
              onChange={(e) => setField("amount", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tx-category" className="text-label">
              Categoria
            </Label>
            <Select
              value={form.category}
              onValueChange={(v) => v && setField("category", v)}
            >
              <SelectTrigger id="tx-category" className="rounded-md">
                <SelectValue placeholder="Seleciona a Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tx-date" className="text-label">
              Data
            </Label>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full rounded-md justify-start gap-2 font-normal text-left !border-primary"
                  />
                }
              >
                <CalendarIcon className="size-4 text-muted-foreground" />
                {form.date ? (
                  format(new Date(form.date + "T00:00:00"), "dd/MM/yyyy", {
                    locale: ptBR,
                  })
                ) : (
                  <span className="text-muted-foreground">dd/mm/aaaa</span>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={ptBR}
                  selected={
                    form.date ? new Date(form.date + "T00:00:00") : undefined
                  }
                  onSelect={(date) =>
                    setField("date", date ? format(date, "yyyy-MM-dd") : "")
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {error && <p className="text-caption text-feedback-error">{error}</p>}
        </form>

        <DialogFooter className="mt-4 bg-white border-none">
          <DialogClose
            render={
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              />
            }
          >
            Cancelar
          </DialogClose>
          <Button form="transaction-form" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
