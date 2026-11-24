import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: string | null;
  reLoginCode: string | null;
  isLoggedIn: boolean;
}

const storedUser = localStorage.getItem("user");
const storedReLoginCode = localStorage.getItem("reLoginCode");

if (storedUser && !storedReLoginCode) {
  localStorage.removeItem("user");
}
if (storedReLoginCode && !storedUser) {
  localStorage.removeItem("reLoginCode");
}

const initialState: AuthState =
  storedUser && storedReLoginCode
    ? {
        user: storedUser,
        reLoginCode: storedReLoginCode,
        isLoggedIn: false,
      }
    : {
        user: null,
        reLoginCode: null,
        isLoggedIn: false,
      };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ user: string; reLoginCode: string }>,
    ) {
      state.user = action.payload.user;
      state.reLoginCode = action.payload.reLoginCode;
      state.isLoggedIn = true;
      localStorage.setItem("user", action.payload.user);
      localStorage.setItem("reLoginCode", action.payload.reLoginCode);
    },
    clearSession(state) {
      state.user = null;
      state.reLoginCode = null;
      state.isLoggedIn = false;
      localStorage.removeItem("user");
      localStorage.removeItem("reLoginCode");
      localStorage.removeItem("appchat.chat-cache");
    },
  },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
