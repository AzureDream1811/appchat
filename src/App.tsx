import { useCallback, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "./hooks/useAppDispatch";
import {
  connectSocket,
  sendSocketEvent,
  subscribeSocketEvent,
  type SocketResponse,
} from "./services/socket";
import { clearSession, setSession } from "./store/slices/authSlice";
import type { LoginResult } from "./types/auth";

export default function App() {
  const dispatch = useAppDispatch();
  const reLoginSent = useRef(false);

  const clearStoredSession = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("reLoginCode");
    dispatch(clearSession());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = subscribeSocketEvent((response: SocketResponse) => {
      if (response.event === "AUTH") {
        clearStoredSession();
        return;
      }

      if (response.event !== "RE_LOGIN") {
        return;
      }

      if (response.status === "error") {
        reLoginSent.current = false;
        clearStoredSession();
        return;
      }

      const data = response.data as LoginResult | undefined;
      const username = localStorage.getItem("user");

      if (!data?.RE_LOGIN_CODE || !username) {
        clearStoredSession();
        return;
      }

      localStorage.setItem("reLoginCode", data.RE_LOGIN_CODE);
      dispatch(setSession({
        username,
        reLoginCode: data.RE_LOGIN_CODE,
      }));
    });

    void connectSocket()
      .then(() => {
        const username = localStorage.getItem("user");
        const reLoginCode = localStorage.getItem("reLoginCode");

        if (username && reLoginCode && !reLoginSent.current) {
          reLoginSent.current = true;
          void sendSocketEvent("RE_LOGIN", {
            user: username,
            code: reLoginCode,
          }).catch(() => {
            reLoginSent.current = false;
          });
          return;
        }

        clearStoredSession();
      })
      .catch((error: unknown) => {
        console.error(error);
        clearStoredSession();
      });

    return unsubscribe;
  }, [clearStoredSession, dispatch]);

  return <Outlet />;
}