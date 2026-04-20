import { configureStore } from "@reduxjs/toolkit";
import { suppliersApi } from "@/store/suppliers-api";

export const store = configureStore({
  reducer: {
    [suppliersApi.reducerPath]: suppliersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(suppliersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
