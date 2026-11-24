import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "./hooks/useAppDispatch";
import { socket } from "./services/socket";
import type { LoginResponseDataDto } from "./types/auth";
import type { WsResponse } from "./types/ws";
import { clearSession, setSession } from "./store/slices/authSlice";

export default function App() {
  const dispatch = useAppDispatch();
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const bootstrapStarted = useRef(false);

  useEffect(() => {
    const unsubscribe = socket.subscribe((response: WsResponse<unknown>) => {
      if (response.event === "AUTH" && response.status === "error") {
        dispatch(clearSession());
      }
    });

    if (bootstrapStarted.current) {
      return unsubscribe;
    }
    bootstrapStarted.current = true;

    async function bootstrap() {
      try {
        await socket.connect();
        const username = localStorage.getItem("user");
        const reLoginCode = localStorage.getItem("reLoginCode");

        if (username && reLoginCode) {
          try {
            const result = await socket.request<LoginResponseDataDto>(
              "RE_LOGIN",
              { user: username, code: reLoginCode },
            );
            dispatch(setSession({ user: username, reLoginCode: result.RE_LOGIN_CODE }));
          } catch (error) {
            console.error(error);
            dispatch(clearSession());
          }
        } else {
          dispatch(clearSession());
        }
      } catch (error) {
        console.error(error);
        dispatch(clearSession());
      } finally {
        setIsRestoringSession(false);
      }
    }

    void bootstrap();

    return unsubscribe;
  }, [dispatch]);

  if (isRestoringSession) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Đang khôi phục phiên đăng nhập...</p>
      </main>
    );
  }

  return <Outlet />;
}