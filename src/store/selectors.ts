import { createSelector } from "@reduxjs/toolkit";
import { hasActiveFilters, toTransactionDraft, toTransactionQuery } from "@/domain";
import type { RootState } from "./index";

export const selectFilters = (state: RootState) => state.transactionsUi.filters;
export const selectEditor = (state: RootState) => state.transactionsUi.editor;
export const selectDeletion = (state: RootState) => state.transactionsUi.deletion;

/** Query da API derivada dos filtros (memoizada: só recalcula se os filtros mudarem). */
export const selectTransactionQuery = createSelector(selectFilters, toTransactionQuery);

export const selectHasActiveFilters = createSelector(selectFilters, hasActiveFilters);

/** Rascunho para o formulário de edição (undefined = criação). */
export const selectEditorDraft = createSelector(selectEditor, (editor) =>
  editor.transaction ? toTransactionDraft(editor.transaction) : undefined
);
