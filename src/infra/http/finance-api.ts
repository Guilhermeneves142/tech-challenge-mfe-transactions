// ─────────────────────────────────────────────
//  Infra · API Client — aponta para o Mock Server
//  Base URL configurável via variável de ambiente
// ─────────────────────────────────────────────

// "/api" (relativo): no multizone o navegador está na origem do host,
// que serve as Route Handlers. Override via NEXT_PUBLIC_API_URL se preciso.
import type {
  Balance,
  Budget,
  Category,
  Dashboard,
  NewTransaction,
  Report,
  Transaction,
  TransactionSummary,
  User,
} from "@/domain";
import { API_BASE_URL, createHttpClient } from "./http-client";

const request = createHttpClient(API_BASE_URL);

export interface TransactionParams {
  _sort?: keyof Transaction;
  _order?: "asc" | "desc";
  _limit?: number;
  _page?: number;
  type?: "credit" | "debit";
  category?: string;
  descriptionLike?: string;
  dateGte?: string;
  dateLte?: string;
}

export interface ReportParams {
  monthLike?: string;
}

const PARAM_KEY_MAP: Partial<Record<keyof TransactionParams, string>> = {
  descriptionLike: "description_like",
  dateGte: "date_gte",
  dateLte: "date_lte",
};

const REPORT_PARAM_KEY_MAP: Partial<Record<keyof ReportParams, string>> = {
  monthLike: "month_like",
};

function toQueryString(params: TransactionParams): string {
  const qs = new URLSearchParams(
    Object.entries(params as Record<string, unknown>)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [
        PARAM_KEY_MAP[k as keyof TransactionParams] ?? k,
        String(v),
      ]),
  ).toString();
  return qs ? `?${qs}` : "";
}

function toReportQueryString(params: ReportParams): string {
  const qs = new URLSearchParams(
    Object.entries(params as Record<string, unknown>)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [
        REPORT_PARAM_KEY_MAP[k as keyof ReportParams] ?? k,
        String(v),
      ]),
  ).toString();
  return qs ? `?${qs}` : "";
}

// ── Endpoints ─────────────────────────────────

export const api = {
  /** Dados do usuário autenticado */
  getUser: () => request<User>("/user"),

  /** Saldo atual + variação */
  getBalance: () => request<Balance>("/balance"),

  /** Lista de transações com filtros opcionais */
  getTransactions: (params?: TransactionParams) =>
    request<Transaction[]>(
      `/transactions${params ? toQueryString(params) : ""}`,
    ),

  /** Transação por ID */
  getTransactionById: (id: number) =>
    request<Transaction>(`/transactions/${id}`),

  /** Receitas, despesas, saldo atual e lançamentos futuros */
  getTransactionsSummary: (params?: TransactionParams) =>
    request<TransactionSummary>(
      `/transactions/summary${params ? toQueryString(params) : ""}`,
    ),

  /** Categorias disponíveis */
  getCategories: () => request<Category[]>("/categories"),

  /** Planejamento / orçamentos por categoria */
  getBudgets: () => request<Budget[]>("/budgets"),

  /** Orçamento por ID */
  getBudgetById: (id: number) => request<Budget>(`/budgets/${id}`),

  /** Dados de relatório mensal com filtro de texto opcional */
  getReports: (params?: ReportParams) =>
    request<Report[]>(`/reports${params ? toReportQueryString(params) : ""}`),

  /** Dashboard consolidado (user + balance + últimas 5 transações) */
  getDashboard: () => request<Dashboard>("/dashboard"),

  /** Cria uma nova transação */
  createTransaction: (body: NewTransaction) =>
    request<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Atualiza uma transação existente */
  updateTransaction: (id: number, body: Partial<NewTransaction>) =>
    request<Transaction>(`/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  /** Remove uma transação */
  deleteTransaction: (id: number) =>
    request<void>(`/transactions/${id}`, { method: "DELETE" }),
};
