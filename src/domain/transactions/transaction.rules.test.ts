import { describe, expect, it } from "vitest";
import {
  EMPTY_TRANSACTION_DRAFT,
  TransactionValidationError,
  parseAmount,
  toNewTransaction,
  toTransactionDraft,
  validateAttachment,
  validateTransactionDraft,
  type Transaction,
  type TransactionDraft,
} from "@/domain";

const valid: TransactionDraft = {
  description: "Mercado",
  amount: "150,90",
  category: "food",
  date: "2026-10-25",
  type: "debit",
};

describe("parseAmount", () => {
  it.each([
    ["10", 10],
    ["10,5", 10.5],
    ["10.50", 10.5],
    ["1.234,56", 1234.56],
  ])("%s → %d", (raw, expected) => expect(parseAmount(raw)).toBeCloseTo(expected));
});

describe("validateTransactionDraft", () => {
  it("aceita rascunho válido", () => expect(validateTransactionDraft(valid)).toBeNull());
  it("rejeita valor inválido", () => {
    for (const amount of ["", "0", "-1", "abc"]) {
      expect(validateTransactionDraft({ ...valid, amount })).toMatch(/valor/);
    }
  });
  it("exige categoria e data", () => {
    expect(validateTransactionDraft({ ...valid, category: "" })).toMatch(/categoria/);
    expect(validateTransactionDraft({ ...valid, date: "" })).toMatch(/data/);
  });
});

describe("toNewTransaction", () => {
  it("despesa vira negativa e anexo vazio vira ''", () => {
    const tx = toNewTransaction(valid, new Date(2026, 9, 25, 14, 30));
    expect(tx).toMatchObject({ amount: -150.9, attachment: "", attachmentName: "" });
    expect(tx.dateLabel).toBe("25 out, 14:30");
  });
  it("lança para rascunho inválido", () => {
    expect(() => toNewTransaction(EMPTY_TRANSACTION_DRAFT)).toThrow(TransactionValidationError);
  });
});

describe("toTransactionDraft", () => {
  it("faz o caminho inverso para o modo edição", () => {
    const tx: Transaction = {
      id: 1, description: "Luz", category: "home", amount: -89.5,
      date: "2026-10-10T03:00:00.000Z", dateLabel: "", type: "debit", attachment: "",
    };
    expect(toTransactionDraft(tx)).toMatchObject({ amount: "89.5", date: "2026-10-10", type: "debit" });
  });
});

describe("validateAttachment", () => {
  it("aceita PDF até 2MB", () => expect(validateAttachment({ type: "application/pdf", size: 1000 })).toBeNull());
  it("rejeita formato e tamanho", () => {
    expect(validateAttachment({ type: "text/plain", size: 10 })).toMatch(/Formato/);
    expect(validateAttachment({ type: "image/png", size: 3 * 1024 * 1024 })).toMatch(/2 MB/);
  });
});
