import type { Transaction } from "../transactions/transaction.entity";
import type { User } from "../user/user.entity";

export interface Balance {
  current: number;
  variation: number;
  variationLabel: string;
}

export interface Budget {
  id: number;
  category: string;
  categoryLabel: string;
  limit: number;
  spent: number;
  period: string;
}

export interface Report {
  month: string;
  income: number;
  expenses: number;
}

export interface Dashboard {
  user: User;
  balance: Balance;
  recentTransactions: Transaction[];
}
