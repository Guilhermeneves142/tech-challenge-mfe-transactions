import { Category } from "@/lib/api";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [] as Category[],
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategories: (state, action) => {
      state.categories = action.payload;
    },
  },
});

export const { addCategories } = categoriesSlice.actions;

export default categoriesSlice.reducer;
