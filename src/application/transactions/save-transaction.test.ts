import { describe, expect, it, vi } from "vitest";
import { TransactionValidationError, type NewTransaction, type TransactionRepository } from "@/domain";
import { makeSaveTransaction } from "./save-transaction";
import { makeListTransactions, nextPageParam } from "./list-transactions";

function fakeRepo(): TransactionRepository {
  return {
    list: vi.fn(async () => []),
    summary: vi.fn(async () => ({ income: 0, expense: 0, currentBalance: 0, future: 0 })),
    create: vi.fn(async (data) => ({ id: 1, ...data })),
    update: vi.fn(async (id, data) => ({ id, ...(data as NewTransaction) })),
    remove: vi.fn(async () => {}),
    listCategories: vi.fn(async () => []),
  };
}

const draft = { description: "Salário", amount: "5000", category: "salary", date: "2026-10-05", type: "credit" as const };

describe("saveTransaction", () => {
  it("cria sem id, edita com id", async () => {
    const repo = fakeRepo();
    const save = makeSaveTransaction(repo, () => new Date(2026, 9, 5, 9));
    await save({ draft });
    await save({ draft, id: 9 });
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(9, expect.objectContaining({ amount: 5000 }));
  });

  it("não chama a API se inválido", async () => {
    const repo = fakeRepo();
    await expect(makeSaveTransaction(repo)({ draft: { ...draft, category: "" } })).rejects.toBeInstanceOf(
      TransactionValidationError
    );
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe("listTransactions", () => {
  it("converte filtros em query paginada", async () => {
    const repo = fakeRepo();
    await makeListTransactions(repo, 10)({ description: "luz", type: "all" }, 2);
    expect(repo.list).toHaveBeenCalledWith({ descriptionLike: "luz", page: 2, limit: 10 });
  });

  it("próxima página só se a última veio cheia", () => {
    expect(nextPageParam(new Array(10), [1, 2], 10)).toBe(3);
    expect(nextPageParam(new Array(4), [1, 2], 10)).toBeUndefined();
  });
});
