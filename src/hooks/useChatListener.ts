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
  getConversationId,
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
      if (data.type !== 0 && data.type !== 1) return;
      if (data.name.toLocaleLowerCase() === username.toLocaleLowerCase()) return;

      const isRoom = data.type === 1;
      const peerName = isRoom ? data.to : data.name;
      const conversationType = isRoom ? "group" : "direct";
      const conversationId = getConversationId(conversationType, peerName);
      const existing = conversationsRef.current.find(
        (item) =>
          item.type === conversationType &&
          item.name.toLocaleLowerCase() === peerName.toLocaleLowerCase(),
      );

      dispatch(
        messageAdded({
          conversationId,
          ...(isRoom
            ? {}
            : {
                conversation:
                  existing ?? createDirectConversation(peerName),
              }),
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
