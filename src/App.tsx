import { useCallback, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "./hooks/useAppDispatch";
import { socket } from "./services/socket";
import type { WsResponse } from "./types/ws";
import { relogin } from "./services/authService";
import { clearSession, setSession } from "./store/slices/authSlice";

export default function App() {
  const dispatch = useAppDispatch();
  const reLoginAttempted = useRef(false);

  const clearStoredSession = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("reLoginCode");
    dispatch(clearSession());
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = socket.subscribe((response: WsResponse<unknown>) => {
      if (response.event === "AUTH" && response.status === "error") {
        clearStoredSession();
        return;
      }
    });

    void socket.connect()
      .then(async () => {
        const username = localStorage.getItem("user");
        const reLoginCode = localStorage.getItem("reLoginCode");

        if (username && reLoginCode) {
          if (reLoginAttempted.current) {
            return;
          }

          reLoginAttempted.current = true;
          try {
            const result = await relogin(username, reLoginCode);
            localStorage.setItem("reLoginCode", result.RE_LOGIN_CODE);
            dispatch(setSession({
              username,
              reLoginCode: result.RE_LOGIN_CODE,
            }));
          } catch (error) {
            console.error(error);
            reLoginAttempted.current = false;
            clearStoredSession();
          }
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