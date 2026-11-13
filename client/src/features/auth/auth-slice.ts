import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/src/features/auth/api/auth-types";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.loading = false;
    },
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const { clearAuth, setAuthenticated, setUser } = authSlice.actions;
export default authSlice.reducer;
