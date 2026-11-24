import { useEffect, useRef, useState } from "react";
import type {
  Conversation,
  Message,
  ReceivedChatMessage,
  RoomMember,
  RoomChatMessage,
} from "../types/chat";
import type { WsResponse } from "../types/ws";
import { socket } from "../services/socket";
import { getDirectChatMessages, sendChatMessage } from "../services/chatService";
import { getRoomChatMessages } from "../services/roomService";

const CHAT_CACHE_KEY = "appchat.chat-cache";
const HISTORY_PAGE_SIZE = 50;

interface ConversationPagination {
  page: number;
  hasMore: boolean;
}

interface ChatCache {
  messages?: Record<string, Message[]>;
  roomMembers?: Record<string, RoomMember[]>;
}

function loadMessageCache(): ChatCache {
  try {
    return JSON.parse(localStorage.getItem(CHAT_CACHE_KEY) ?? "{}") as ChatCache;
  } catch {
    return {};
  }
}

export function useChatMessages(
  myName: string,
  selectedId: string | null,
  selectedConversation: Conversation | undefined,
) {
  const [initialCache] = useState(loadMessageCache);
  const [messages, setMessages] = useState<Record<string, Message[]>>(
    initialCache.messages ?? {},
  );
  const [roomMembers, setRoomMembers] = useState<Record<string, RoomMember[]>>(
    initialCache.roomMembers ?? {},
  );
  const [pagination, setPagination] = useState<Record<string, ConversationPagination>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);

  const currentMessages = selectedId ? messages[selectedId] ?? [] : [];

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CHAT_CACHE_KEY) ?? "{}") as Record<string, unknown>;
      localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify({
        ...cached,
        messages,
        roomMembers,
      }));
    } catch {
      localStorage.removeItem(CHAT_CACHE_KEY);
    }
  }, [messages, roomMembers]);

  useEffect(() => {
    const unsubscribe = socket.subscribe((response: WsResponse<unknown>) => {
      if (response.event !== "SEND_CHAT" || response.status !== "success") return;

      const data = response.data as ReceivedChatMessage | undefined;
      if (!data || data.name === myName) return;

      const conversationId = data.type === 1
        ? `room-${data.to}`
        : `user-${data.name}`;

      setMessages((previous) => ({
        ...previous,
        [conversationId]: [...(previous[conversationId] ?? []), {
          id: `msg-${data.id}`,
          conversationId,
          senderName: data.name,
          content: data.mes,
          createdAt: data.createAt ?? new Date().toLocaleTimeString(),
          isMe: false,
        }],
      }));
    });

    return unsubscribe;
  }, [myName]);

  async function selectConversation(conversation: Conversation): Promise<void> {
    if (conversation.type === "group") {
      const response = await getRoomChatMessages(conversation.name, 1);
      const roomId = `room-${conversation.name}`;
      const members = response.user ?? response.userList ?? [];
      const history = response.chatMess ?? response.chatData ?? [];

      setRoomMembers((previous) => ({
        ...previous,
        [conversation.name]: members,
      }));
      setMessages((previous) => ({
        ...previous,
        [roomId]: history.map((message) => mapRoomMessage(roomId, message, myName)),
      }));
      setPagination((previous) => ({
        ...previous,
        [roomId]: { page: 1, hasMore: history.length >= HISTORY_PAGE_SIZE },
      }));
      return;
    }

    const history = await getDirectChatMessages(conversation.name, 1);
    setMessages((previous) => ({
      ...previous,
      [conversation.id]: history.map((message) => ({
        id: `msg-${message.id}`,
        conversationId: conversation.id,
        senderName: message.name,
        content: message.mes,
        createdAt: message.createAt,
        isMe: message.name === myName,
      })),
    }));
    setPagination((previous) => ({
      ...previous,
      [conversation.id]: { page: 1, hasMore: history.length >= HISTORY_PAGE_SIZE },
    }));
  }

  async function loadMoreMessages(): Promise<void> {
    if (
      !selectedId ||
      !selectedConversation ||
      loadingMoreRef.current ||
      !pagination[selectedId]?.hasMore
    ) {
      return;
    }

    const conversationId = selectedId;
    const conversation = selectedConversation;
    const nextPage = pagination[conversationId].page + 1;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      if (conversation.type === "group") {
        const response = await getRoomChatMessages(conversation.name, nextPage);
        const history = response.chatMess ?? response.chatData ?? [];
        const olderMessages = history.map((message) =>
          mapRoomMessage(conversationId, message, myName),
        );
        setMessages((previous) => ({
          ...previous,
          [conversationId]: [...olderMessages, ...(previous[conversationId] ?? [])],
        }));
        setPagination((previous) => ({
          ...previous,
          [conversationId]: {
            page: nextPage,
            hasMore: history.length >= HISTORY_PAGE_SIZE,
          },
        }));
      } else {
        const history = await getDirectChatMessages(conversation.name, nextPage);
        const olderMessages = history.map((message) => ({
          id: `msg-${message.id}`,
          conversationId,
          senderName: message.name,
          content: message.mes,
          createdAt: message.createAt,
          isMe: message.name === myName,
        }));
        setMessages((previous) => ({
          ...previous,
          [conversationId]: [...olderMessages, ...(previous[conversationId] ?? [])],
        }));
        setPagination((previous) => ({
          ...previous,
          [conversationId]: {
            page: nextPage,
            hasMore: history.length >= HISTORY_PAGE_SIZE,
          },
        }));
      }
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }

  async function sendMessage(content: string): Promise<void> {
    if (!selectedId || !selectedConversation) return;

    const optimisticMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedId,
      senderName: myName,
      content,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setMessages((previous) => ({
      ...previous,
      [selectedId]: [...(previous[selectedId] ?? []), optimisticMessage],
    }));

    try {
      await sendChatMessage(
        selectedConversation.type === "group" ? "room" : "people",
        selectedConversation.name,
        content,
      );
    } catch (error) {
      setMessages((previous) => ({
        ...previous,
        [selectedId]: (previous[selectedId] ?? []).filter(
          (message) => message.id !== optimisticMessage.id,
        ),
      }));
      throw error;
    }
  }

  function ensureDirectConversation(conversationId: string) {
    setMessages((previous) =>
      previous[conversationId]
        ? previous
        : { ...previous, [conversationId]: [] },
    );
  }

  function setRoomHistory(roomName: string, messages: RoomChatMessage[], members: RoomMember[] = []) {
    const roomId = `room-${roomName}`;
    setRoomMembers((previous) => ({ ...previous, [roomName]: members }));
    setMessages((previous) => ({
      ...previous,
      [roomId]: messages.map((message) => mapRoomMessage(roomId, message, myName)),
    }));
    setPagination((previous) => ({
      ...previous,
      [roomId]: { page: 1, hasMore: messages.length >= HISTORY_PAGE_SIZE },
    }));
  }

  function removeConversation(conversationId: string, roomName?: string) {
    setMessages((previous) => {
      const next = { ...previous };
      delete next[conversationId];
      return next;
    });
    if (roomName) {
      setRoomMembers((previous) => {
        const next = { ...previous };
        delete next[roomName];
        return next;
      });
    }
    setPagination((previous) => {
      const next = { ...previous };
      delete next[conversationId];
      return next;
    });
  }

  return {
    messages,
    currentMessages,
    roomMembers,
    hasMoreMessages: selectedId ? pagination[selectedId]?.hasMore ?? false : false,
    isLoadingMore,
    setRoomHistory,
    ensureDirectConversation,
    selectConversation,
    loadMoreMessages,
    sendMessage,
    removeConversation,
  };
}

function mapRoomMessage(
  conversationId: string,
  message: RoomChatMessage,
  myName: string,
): Message {
  return {
    id: `msg-${message.id}`,
    conversationId,
    senderName: message.name,
    content: message.mes,
    createdAt: message.createAt,
    isMe: message.name === myName,
  };
}
