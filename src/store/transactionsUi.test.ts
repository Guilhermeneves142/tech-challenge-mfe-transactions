import { describe, expect, it } from "vitest";
import type { Transaction } from "@/domain";
import { makeStore } from "./index";
import { selectEditorDraft, selectHasActiveFilters, selectTransactionQuery } from "./selectors";
import {
  createRequested,
  dateRangeChanged,
  descriptionFilterChanged,
  editorClosed,
  editRequested,
  filtersReset,
  typeFilterChanged,
} from "./slices/transactionsUi.slice";

const tx: Transaction = {
  id: 3, description: "Uber", category: "transport", amount: -32,
  date: "2026-10-20T03:00:00.000Z", dateLabel: "", type: "debit", attachment: "",
};

describe("transactionsUi (Redux)", () => {
  it("filtros → query da API via selector memoizado", () => {
    const store = makeStore();
    store.dispatch(descriptionFilterChanged("uber"));
    store.dispatch(typeFilterChanged("debit"));
    store.dispatch(dateRangeChanged({ from: "2026-10-01", to: "2026-10-31" }));

    const q1 = selectTransactionQuery(store.getState());
    expect(q1).toMatchObject({ descriptionLike: "uber", type: "debit" });
    expect(selectTransactionQuery(store.getState())).toBe(q1); // memoizado
    expect(selectHasActiveFilters(store.getState())).toBe(true);

    store.dispatch(filtersReset());
    expect(selectHasActiveFilters(store.getState())).toBe(false);
  });

  it("modal de edição guarda a transação e gera o rascunho", () => {
    const store = makeStore();
    store.dispatch(editRequested(tx));
    expect(store.getState().transactionsUi.editor.open).toBe(true);
    expect(selectEditorDraft(store.getState())).toMatchObject({ amount: "32", type: "debit" });

    store.dispatch(editorClosed());
    // fecha mas mantém os dados (animação de saída)
    expect(store.getState().transactionsUi.editor).toMatchObject({ open: false, transaction: tx });

    store.dispatch(createRequested());
    expect(selectEditorDraft(store.getState())).toBeUndefined();
  });

  it("cada makeStore() é isolado (sem vazar estado entre requests)", () => {
    const a = makeStore();
    a.dispatch(descriptionFilterChanged("x"));
    expect(makeStore().getState().transactionsUi.filters.description).toBe("");
  });
});
