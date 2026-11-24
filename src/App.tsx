import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "./hooks/useAppDispatch";
import { socket } from "./services/socket";
import type { LoginResponse } from "./types/auth";
import type { WsResponse } from "./types/ws";
import type { ReceivedChatMessage } from "./types/chat";
import { clearSession, setSession } from "./store/slices/authSlice";
import { messageAdded } from "./store/slices/chatSlice";
import { store } from "./store/reduxStore";
import { createMessageId, formatChatTime } from "./utils/chatMessage";

export default function App() {
  const dispatch = useAppDispatch();
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const bootstrapStarted = useRef(false);

  useEffect(() => {
    const unsubscribe = socket.subscribe((response: WsResponse<unknown>) => {
      if (
        (response.event === "AUTH" || response.event === "RE_LOGIN") &&
        response.status === "error"
      ) {
        dispatch(clearSession());
        return;
      }

      if (response.event !== "SEND_CHAT" || response.status !== "success") return;

      const currentUser = store.getState().auth.user;
      const data = response.data as ReceivedChatMessage | undefined;
      if (!currentUser || !data || data.name === currentUser) return;

      const isRoom = data.type === 1;
      const name = isRoom ? data.to : data.name;
      const conversationId = `${isRoom ? "room" : "user"}-${name}`;
      const createdAt = formatChatTime(data.createAt);

      dispatch(messageAdded({
        conversationId,
        conversation: {
          id: conversationId,
          name,
          avatar: `https://api.dicebear.com/7.x/${
            isRoom ? "bottts" : "avataaars"
          }/svg?seed=${encodeURIComponent(name)}`,
          type: isRoom ? "group" : "direct",
          lastMessage: "",
          lastMessageTime: "",
          unreadCount: 0,
          isOnline: false,
        },
        message: {
          id: createMessageId(data.id),
          conversationId,
          senderName: data.name,
          content: data.mes,
          createdAt,
          isMe: false,
        },
      }));
    });

    if (bootstrapStarted.current) {
      return unsubscribe;
    }
    bootstrapStarted.current = true;

    async function bootstrap() {
      localStorage.removeItem("appchat.chat-cache");
      try {
        await socket.connect();
        const username = localStorage.getItem("user");
        const reLoginCode = localStorage.getItem("reLoginCode");

        if (username && reLoginCode) {
          try {
            const result = await socket.request<LoginResponse>(
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