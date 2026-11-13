import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";
export type ThemeAccent = "sage" | "ocean" | "violet";

interface ThemeState {
  mode: ThemeMode;
  accent: ThemeAccent;
  hydrated: boolean;
}

const initialState: ThemeState = { mode: "light", accent: "sage", hydrated: false };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<{ mode: ThemeMode; accent: ThemeAccent }>) {
      state.mode = action.payload.mode;
      state.accent = action.payload.accent;
      state.hydrated = true;
    },
    hydrateTheme(state, action: PayloadAction<{ mode: ThemeMode; accent: ThemeAccent }>) {
      state.mode = action.payload.mode;
      state.accent = action.payload.accent;
      state.hydrated = true;
    },
  },
});

export const { setTheme, hydrateTheme } = themeSlice.actions;
export default themeSlice.reducer;
