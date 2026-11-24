import { useCallback, useEffect, useState } from "react";
import type { Conversation } from "../types/chat";
import { getUserList } from "../services/userService";

const CHAT_CACHE_KEY = "appchat.chat-cache";

interface ChatCache {
  conversations: Conversation[];
  selectedId: string | null;
}

function loadConversationCache(): ChatCache {
  try {
    const cached = JSON.parse(localStorage.getItem(CHAT_CACHE_KEY) ?? "{}") as {
      conversations?: Conversation[];
      selectedId?: string | null;
    };
    return {
      conversations: cached.conversations ?? [],
      selectedId: cached.selectedId ?? null,
    };
  } catch {
    return { conversations: [], selectedId: null };
  }
}

export function useChatConversations(user: string | null) {
  const [initialCache] = useState(loadConversationCache);
  const [conversations, setConversations] = useState(initialCache.conversations);
  const [selectedId, setSelectedId] = useState(initialCache.selectedId);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId,
  );

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CHAT_CACHE_KEY) ?? "{}") as {
        messages?: unknown;
        conversations?: Conversation[];
        selectedId?: string | null;
      };
      localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify({
        ...cached,
        conversations,
        selectedId,
      }));
    } catch {
      localStorage.removeItem(CHAT_CACHE_KEY);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    async function loadConversations() {
      if (!user) return;

      try {
        const userList = await getUserList();
        const serverConversations = userList.map((item) => {
          const isRoom = item.type === 1;
          return {
            id: isRoom ? `room-${item.name}` : `user-${item.name}`,
            name: item.name,
            avatar: `https://api.dicebear.com/7.x/${
              isRoom ? "bottts" : "avataaars"
            }/svg?seed=${encodeURIComponent(item.name)}`,
            type: isRoom ? "group" as const : "direct" as const,
            lastMessage: "",
            lastMessageTime: item.actionTime,
            unreadCount: 0,
            isOnline: false,
          };
        });

        setConversations((previous) => {
          const serverIds = new Set(serverConversations.map((item) => item.id));
          const cachedOnly = previous.filter((item) => !serverIds.has(item.id));
          return [...serverConversations, ...cachedOnly];
        });
      } catch (error) {
        console.error("Không thể tải danh sách conversation:", error);
      }
    }

    void loadConversations();
  }, [user]);

  const addOrUpdateConversation = useCallback((conversation: Conversation) => {
    setConversations((previous) => {
      const existing = previous.find((item) => item.id === conversation.id);
      if (existing) {
        return previous.map((item) =>
          item.id === conversation.id ? { ...item, ...conversation } : item,
        );
      }
      return [conversation, ...previous];
    });
  }, []);

  const updateConversation = useCallback(
    (conversationId: string, update: Partial<Conversation>) => {
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, ...update }
            : conversation,
        ),
      );
    },
    [],
  );

  const removeConversation = useCallback((conversationId: string) => {
    setConversations((previous) =>
      previous.filter((conversation) => conversation.id !== conversationId),
    );
  }, []);

  const startDirectChat = useCallback((username: string) => {
    const conversationId = `user-${username}`;
    setConversations((previous) => {
      if (previous.some((item) => item.id === conversationId)) return previous;
      return [{
        id: conversationId,
        name: username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
        type: "direct",
        lastMessage: "",
        lastMessageTime: "",
        unreadCount: 0,
        isOnline: false,
      }, ...previous];
    });
    setSelectedId(conversationId);
  }, []);

  return {
    conversations,
    selectedId,
    selectedConversation,
    setSelectedId,
    setConversations,
    addOrUpdateConversation,
    updateConversation,
    removeConversation,
    startDirectChat,
  };
}
