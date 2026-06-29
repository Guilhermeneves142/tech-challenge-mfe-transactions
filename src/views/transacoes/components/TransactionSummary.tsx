"use client";

import { Card } from "@vandrei/finance-ui";
import type { TransactionSummary as Summary } from "@/lib/api";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface TransactionSummaryProps {
  summary: Summary | undefined;
}

export function TransactionSummary({ summary }: TransactionSummaryProps) {
  const cards = [
    {
      label: "Receitas",
      value: summary?.income ?? 0,
      className: "bg-brand-secondary text-primary",
    },
    {
      label: "Despesas",
      value: summary?.expense ?? 0,
      className: "bg-feedback-error text-card",
    },
    {
      label: "Seu Saldo Atual",
      value: summary?.currentBalance ?? 0,
      className: "bg-brand-tertiary text-card sm:col-span-2 xl:col-span-1",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:mx-10 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 xl:gap-10 my-6">
      {cards.map((card) => (
        <Card key={card.label} className={`p-6 ${card.className}`}>
          <h4>{card.label}</h4>
          <h2 className="pe-4 -mt-3">{formatCurrency(card.value)}</h2>
        </Card>
      ))}
    </section>
  );
}
