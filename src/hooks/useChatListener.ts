import { useEffect } from "react";
import { socket } from "../services/socket";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import { messageAdded } from "../store/slices/chatSlice";
import type { ReceivedChatMessage } from "../types/chat";
import {
  createDirectConversation,
  createMessageId,
  formatChatTime,
} from "../utils/chatMessage";

export function useChatListener() {
  const dispatch = useAppDispatch();
  const username = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!username) return;

    return socket.subscribe((res) => {
      if (res.event !== "SEND_CHAT" || res.status !== "success") return;

      const data = res.data as ReceivedChatMessage;
      if (data.type !== 0 || data.name === username) return;

      const conversationId = `user-${data.name}`;
      dispatch(
        messageAdded({
          conversationId,
          conversation: createDirectConversation(data.name),
          message: {
            id: createMessageId(data.id),
            conversationId,
            senderName: data.name,
            content: data.mes,
            createdAt: formatChatTime(data.createAt),
            isMe: false,
          },
        }),
      );
    });
  }, [dispatch, username]);
}
