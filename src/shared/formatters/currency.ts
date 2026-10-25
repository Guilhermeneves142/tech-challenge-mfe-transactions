const CURRENCY = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 1234.5 → "R$ 1.234,50" */
export function formatCurrency(value: number): string {
  return CURRENCY.format(value);
}

/** -50 → "- R$ 50,00" · 50 → "+ R$ 50,00" */
export function formatSignedCurrency(value: number): string {
  return `${value < 0 ? "- " : "+ "}${CURRENCY.format(Math.abs(value))}`;
}

/** "Mercado, despesa de R$ 50,00" — usado em aria-labels. */
export function describeTransactionAmount(description: string, amount: number): string {
  return `${description}, ${amount < 0 ? "despesa" : "receita"} de ${CURRENCY.format(Math.abs(amount))}`;
}
