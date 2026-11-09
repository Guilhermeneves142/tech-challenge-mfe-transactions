import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  EMPTY_FILTERS,
  type Transaction,
  type TransactionFilterState,
  type TransactionTypeFilter,
} from "@/domain";

// ─────────────────────────────────────────────
//  Estado de UI da tela de Transações (cliente).
//  Dados que vêm da API (transações, resumo, categorias) NÃO ficam aqui:
//  são estado de servidor e vivem no React Query.
// ─────────────────────────────────────────────

interface ModalState {
  open: boolean;
  /** Mantido ao fechar para o conteúdo não "sumir" durante a animação de saída. */
  transaction?: Transaction;
}

export interface TransactionsUiState {
  filters: TransactionFilterState;
  /** Modal de criar/editar. `transaction` ausente → modo criação. */
  editor: ModalState;
  deletion: ModalState;
}

const initialState: TransactionsUiState = {
  filters: EMPTY_FILTERS,
  editor: { open: false },
  deletion: { open: false },
};

const transactionsUiSlice = createSlice({
  name: "transactionsUi",
  initialState,
  reducers: {
    // ── filtros
    descriptionFilterChanged(state, action: PayloadAction<string>) {
      state.filters.description = action.payload;
    },
    typeFilterChanged(state, action: PayloadAction<TransactionTypeFilter>) {
      state.filters.type = action.payload;
    },
    dateRangeChanged(state, action: PayloadAction<{ from?: string; to?: string }>) {
      state.filters.from = action.payload.from;
      state.filters.to = action.payload.to;
    },
    dateRangeCleared(state) {
      state.filters.from = undefined;
      state.filters.to = undefined;
    },
    filtersReset(state) {
      state.filters = EMPTY_FILTERS;
    },

    // ── modais
    createRequested(state) {
      state.editor = { open: true };
    },
    editRequested(state, action: PayloadAction<Transaction>) {
      state.editor = { open: true, transaction: action.payload };
    },
    editorClosed(state) {
      state.editor.open = false;
    },
    deleteRequested(state, action: PayloadAction<Transaction>) {
      state.deletion = { open: true, transaction: action.payload };
    },
    deletionClosed(state) {
      state.deletion.open = false;
    },
  },
});

export const {
  descriptionFilterChanged,
  typeFilterChanged,
  dateRangeChanged,
  dateRangeCleared,
  filtersReset,
  createRequested,
  editRequested,
  editorClosed,
  deleteRequested,
  deletionClosed,
} = transactionsUiSlice.actions;

export default transactionsUiSlice.reducer;
