import { configureStore } from "@reduxjs/toolkit";
import transactionsUi from "./slices/transactionsUi.slice";

/**
 * Factory (e não singleton): no App Router cada request/árvore ganha seu store,
 * evitando vazar estado entre usuários no SSR.
 */
export function makeStore() {
  return configureStore({
    reducer: { transactionsUi },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
