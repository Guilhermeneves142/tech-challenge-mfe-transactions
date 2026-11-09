import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { NewTransaction, Transaction, TransactionType } from "./transaction.entity";

// ─────────────────────────────────────────────
//  Regras de negócio de transação (funções puras → testáveis).
// ─────────────────────────────────────────────

export const DESCRIPTION_MAX_LENGTH = 20;

/** O que o usuário preenche no formulário (strings, como vêm do input). */
export interface TransactionDraft {
  description: string;
  amount: string;
  category: string;
  /** yyyy-MM-dd */
  date: string;
  type: TransactionType;
  attachment?: string;
  attachmentName?: string;
}

export const EMPTY_TRANSACTION_DRAFT: TransactionDraft = {
  description: "",
  amount: "",
  category: "",
  date: "",
  type: "credit",
  attachment: "",
};

export class TransactionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionValidationError";
  }
}

/** Aceita "10", "10,5", "10.50" e "1.234,56" (pt-BR com milhar). */
export function parseAmount(raw: string): number {
  const value = raw.trim();
  if (!value) return NaN;
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  return Number(normalized);
}

export function validateTransactionDraft(draft: TransactionDraft): string | null {
  if (!draft.description.trim()) return "Descrição é obrigatória.";
  if (draft.description.trim().length > DESCRIPTION_MAX_LENGTH)
    return `Descrição deve ter no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`;
  const amount = parseAmount(draft.amount);
  if (!Number.isFinite(amount) || amount <= 0) return "Informe um valor válido.";
  if (!draft.category) return "Selecione uma categoria.";
  if (!draft.date) return "Selecione uma data.";
  return null;
}

/** Despesa é sempre negativa; receita sempre positiva. */
export function toSignedAmount(amount: number, type: TransactionType): number {
  const abs = Math.abs(amount);
  return type === "debit" ? -abs : abs;
}

/** Ex.: "25 out, 14:32" — data escolhida + hora atual. */
export function buildDateLabel(date: string, now: Date): string {
  const withTime = new Date(`${date}T${format(now, "HH:mm:ss")}`);
  return format(withTime, "dd MMM, HH:mm", { locale: ptBR });
}

/** Rascunho do formulário → entidade a persistir. Lança se inválido. */
export function toNewTransaction(draft: TransactionDraft, now: Date = new Date()): NewTransaction {
  const error = validateTransactionDraft(draft);
  if (error) throw new TransactionValidationError(error);

  return {
    description: draft.description.trim(),
    amount: toSignedAmount(parseAmount(draft.amount), draft.type),
    category: draft.category,
    date: new Date(draft.date).toISOString(),
    dateLabel: buildDateLabel(draft.date, now),
    type: draft.type,
    attachment: draft.attachment || "",
    attachmentName: draft.attachmentName || "",
  };
}

/** Entidade → rascunho (abrir o formulário em modo edição). */
export function toTransactionDraft(tx: Transaction): TransactionDraft {
  return {
    description: tx.description,
    category: tx.category,
    amount: Math.abs(tx.amount).toString(),
    date: tx.date.split("T")[0],
    type: tx.amount < 0 ? "debit" : "credit",
    attachment: tx.attachment,
    attachmentName: tx.attachmentName,
  };
}
