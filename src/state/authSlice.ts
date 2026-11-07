import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AuthSession } from "../domain/auth/AuthSession";
import { mapLoginResponseToSession } from "../mappers/authMapper";
import {
  login as loginUser,
  register as registerUser,
} from "../services/authService";

export type AuthStatus =
  | "idle"
  | "connecting"
  | "success"
  | "authenticated"
  | "error";

export interface AuthState {
  status: AuthStatus;
  session: AuthSession | null;
  error: string | null;
}

const initialState: AuthState = {
  status: "idle",
  session: null,
  error: null,
};

export const register = createAsyncThunk<
  string,
  { username: string; password: string },
  { rejectValue: string }
>("auth/register", async ({ username, password }, { rejectWithValue }) => {
  try {
    return await registerUser(username, password);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Registration failed.",
    );
  }
});

export const login = createAsyncThunk<
  AuthSession,
  { username: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ username, password }, { rejectWithValue }) => {
  try {
    const response = await loginUser(username, password);
    return mapLoginResponseToSession(username, response);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Login failed.",
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStarted(state) {
      state.status = "connecting";
      state.error = null;
    },
    loginSucceeded(state, action: PayloadAction<AuthSession>) {
      state.status = "authenticated";
      state.session = action.payload;
      state.error = null;
    },
    loginFailed(state, action: PayloadAction<string>) {
      state.status = "error";
      state.session = null;
      state.error = action.payload;
    },
    logout(state) {
      state.status = "idle";
      state.session = null;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
      if (state.status === "error") {
        state.status = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = "connecting";
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "success";
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Registration failed.";
      })
      .addCase(login.pending, (state) => {
        state.status = "connecting";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.session = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.session = null;
        state.error = action.payload ?? "Login failed.";
      });
  },
});

export const {
  loginStarted,
  loginSucceeded,
  loginFailed,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
