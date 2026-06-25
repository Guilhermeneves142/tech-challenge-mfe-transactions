import { configureStore } from "@reduxjs/toolkit";

import categories from "../features/categories/categories";

const store = configureStore({
  reducer: {
    categories,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
