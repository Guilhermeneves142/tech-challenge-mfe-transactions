"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Search, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import {
  Button,
  Calendar,
  Card,
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

function formatRangeLabel(range: DateRange | undefined) {
  if (!range?.from) return null;
  const from = format(range.from, "dd/MM/yyyy");
  return range.to ? `${from} - ${format(range.to, "dd/MM/yyyy")}` : from;
}

const TYPE_LABELS: Record<string, string> = {
  credit: "Receita",
  debit: "Despesa",
};

interface TransactionFiltersProps {
  filterType: string;
  filterRange: DateRange | undefined;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (value: string | null) => void;
  onRangeChange: (range: DateRange | undefined) => void;
  onClearRange: () => void;
  onNewTransaction: () => void;
}

export function TransactionFilters({
  filterType,
  filterRange,
  onDescriptionChange,
  onTypeChange,
  onRangeChange,
  onClearRange,
  onNewTransaction,
}: TransactionFiltersProps) {
  const rangeLabel = formatRangeLabel(filterRange);

  return (
    <Card className="flex flex-col sm:flex-row items-end gap-5 py-6 px-6 flex-wrap">
      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <Label className="text-label">Período</Label>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  aria-label="Selecionar período"
                  className="w-full sm:w-56 h-8 justify-start gap-2 font-normal !border-primary"
                />
              }
            >
              <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
              {rangeLabel ?? (
                <span className="text-muted-foreground">
                  dd/mm/aaaa - dd/mm/aaaa
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                locale={ptBR}
                selected={filterRange}
                onSelect={onRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          {filterRange && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Limpar período"
              className="size-8 shrink-0"
              onClick={onClearRange}
            >
              <X className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 w-full sm:flex-1">
        <Label htmlFor="filter-description" className="text-label">
          Buscar
        </Label>
        <Input
          id="filter-description"
          type="search"
          placeholder="Descrição"
          className="w-full min-w-24"
          onChange={(e) => onDescriptionChange(e.target.value)}
          icon={<Search className="size-4 text-primary" aria-hidden />}
          iconSide="left"
        />
      </div>

      <div className="flex flex-col gap-1 w-full sm:w-48">
        <Label id="transaction-type-label" className="text-label">
          Tipo
        </Label>
        <Select value={filterType} onValueChange={onTypeChange}>
          <SelectTrigger
            aria-labelledby="transaction-type-label"
            aria-label="Filtrar por tipo de transação"
            className="w-full cursor-pointer"
          >
            <SelectValue placeholder="Todos os tipos">
              {(v) => TYPE_LABELS[v as string] ?? "Todos os tipos"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            side="bottom"
            className="p-1"
            sideOffset={6}
            align="start"
            alignItemWithTrigger={false}
          >
            <SelectItem className="cursor-pointer" value="all">
              Todos os tipos
            </SelectItem>
            <SelectItem className="cursor-pointer" value="credit">
              Receita
            </SelectItem>
            <SelectItem className="cursor-pointer" value="debit">
              Despesa
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="default"
        className="cursor-pointer w-full sm:w-auto shrink-0"
        onClick={onNewTransaction}
      >
        <Plus size={16} aria-hidden />
        Nova Transação
      </Button>
    </Card>
  );
}
