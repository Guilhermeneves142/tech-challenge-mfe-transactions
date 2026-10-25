import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, hasActiveFilters, toTransactionQuery } from "@/domain";

describe("toTransactionQuery", () => {
  it("sem filtros → query vazia", () => {
    expect(toTransactionQuery(EMPTY_FILTERS)).toEqual({});
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it("monta descrição (trim), tipo e período do dia inteiro", () => {
    expect(
      toTransactionQuery({ description: "  mercado ", type: "debit", from: "2026-10-01", to: "2026-10-31" })
    ).toEqual({
      descriptionLike: "mercado",
      type: "debit",
      dateGte: "2026-10-01T00:00:00.000Z",
      dateLte: "2026-10-31T23:59:59.999Z",
    });
  });

  it("tipo 'all' não vai para a API", () => {
    expect(toTransactionQuery({ ...EMPTY_FILTERS, type: "all" }).type).toBeUndefined();
  });
});
