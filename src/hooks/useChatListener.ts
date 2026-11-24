import { useEffect, useRef } from "react";
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
  const username = useAppSelector((s) => s.auth.user);
  const conversations = useAppSelector((s) => s.chat.conversations);
  const dispatch = useAppDispatch();

  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    if (!username) return;

    return socket.subscribe((res) => {
        if (res.event !== "SEND_CHAT" || res.status !== "success") return;
        
        const data = res.data as ReceivedChatMessage;
      if (data.name === username) return;

      if (data.type === 0) {
        const existing = conversationsRef.current.find(
          (item) => item.name.toLocaleLowerCase() === data.name.toLocaleLowerCase() 
          && item.type === "direct",
        );
        const conversationId = existing ? existing.id : `user-${data.name}`;

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
      }

      if (data.type === 1) {
        const conversationId = `room-${data.to}`;
        dispatch(
          messageAdded({
            conversationId,
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
      }
    });
  }, [dispatch, username]);
}
