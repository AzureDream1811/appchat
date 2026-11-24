import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "./hooks/useAppDispatch";
import { socket } from "./services/socket";
import type { LoginResponse } from "./types/auth";
import { clearSession, setSession } from "./store/slices/authSlice";

export default function App() {
  const dispatch = useAppDispatch();
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const bootstrapStarted = useRef(false);

  useEffect(() => {
    const unsubscribe = socket.subscribe((response) => {
      console.log("WS IN:", response);
      if (response.event === "AUTH" && response.status === "error") {
        dispatch(clearSession());
      }
    });

    if (!bootstrapStarted.current) {
      bootstrapStarted.current = true;
      void bootstrap();
    }

    return unsubscribe;

    async function bootstrap() {
      try {
        await socket.connect();
        const user = localStorage.getItem("user");
        const code = localStorage.getItem("reLoginCode");

        if (!user || !code) {
          dispatch(clearSession());
          return;
        }

        const result = await socket.request<LoginResponse>("RE_LOGIN", { user, code });
        dispatch(setSession({ user, reLoginCode: result.RE_LOGIN_CODE }));
      } catch (error) {
        console.error(error);
        dispatch(clearSession());
      } finally {
        setIsRestoringSession(false);
      }
    }
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