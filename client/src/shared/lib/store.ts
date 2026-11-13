import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/src/features/auth/auth-slice";
import themeReducer from "@/src/features/theme/theme-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
