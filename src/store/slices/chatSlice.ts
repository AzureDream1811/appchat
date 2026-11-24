import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Conversation, Message, RoomMember } from "../../types/chat";
import { clearSession, setSession } from "./authSlice";

interface ConversationPagination {
  page: number;
  hasMore: boolean;
}

interface ChatState {
  owner: string | null;
  conversations: Conversation[];
  selectedId: string | null;
  messages: Record<string, Message[]>;
  roomMembers: Record<string, RoomMember[]>;
  pagination: Record<string, ConversationPagination>;
  isLoadingMore: boolean;
}

interface HistoryLoadedPayload {
  conversationId: string;
  messages: Message[];
  page: number;
  hasMore: boolean;
  roomMembers?: RoomMember[];
}

interface MessageAddedPayload {
  conversationId: string;
  message: Message;
  conversation?: Conversation;
}

const initialState: ChatState = {
  owner: null,
  conversations: [],
  selectedId: null,
  messages: {},
  roomMembers: {},
  pagination: {},
  isLoadingMore: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    conversationsLoaded(state, action: PayloadAction<Conversation[]>) {
      const loadedIds = new Set(action.payload.map((conversation) => conversation.id));
      const conversationsWithMessages = state.conversations.filter(
        (conversation) =>
          !loadedIds.has(conversation.id) &&
          (state.messages[conversation.id]?.length ?? 0) > 0,
      );
      state.conversations = [
        ...action.payload.map((conversation) => {
          const existing = state.conversations.find(
            (item) => item.id === conversation.id,
          );
          return existing
            ? {
                ...conversation,
                lastMessage: existing.lastMessage || conversation.lastMessage,
                lastMessageTime:
                  existing.lastMessageTime || conversation.lastMessageTime,
                unreadCount: existing.unreadCount ?? conversation.unreadCount,
              }
            : conversation;
        }),
        ...conversationsWithMessages,
      ];

      if (!state.conversations.some((item) => item.id === state.selectedId)) {
        state.selectedId = null;
      }
    },
    conversationUpserted(state, action: PayloadAction<Conversation>) {
      const existing = state.conversations.findIndex(
        (conversation) => conversation.id === action.payload.id,
      );
      if (existing === -1) {
        state.conversations.unshift(action.payload);
      } else {
        state.conversations[existing] = {
          ...state.conversations[existing],
          ...action.payload,
        };
      }
    },
    conversationSelected(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload;
      const selected = state.conversations.find(
        (conversation) => conversation.id === action.payload,
      );
      if (selected) selected.unreadCount = 0;
    },
    conversationRemoved(state, action: PayloadAction<string>) {
      const conversationId = action.payload;
      state.conversations = state.conversations.filter(
        (conversation) => conversation.id !== conversationId,
      );
      delete state.messages[conversationId];
      delete state.roomMembers[conversationId];
      delete state.pagination[conversationId];
      if (state.selectedId === conversationId) state.selectedId = null;
    },
    historyLoaded(state, action: PayloadAction<HistoryLoadedPayload>) {
      const { conversationId, messages, page, hasMore, roomMembers } = action.payload;
      const combined = [...messages, ...(state.messages[conversationId] ?? [])];
      const seenIds = new Set<string>();
      state.messages[conversationId] = combined.filter((message) => {
        if (seenIds.has(message.id)) return false;
        seenIds.add(message.id);
        return true;
      });
      state.pagination[conversationId] = { page, hasMore };
      if (roomMembers) state.roomMembers[conversationId] = roomMembers;

      if (page === 1 && messages.length > 0) {
        const conversation = state.conversations.find(
          (item) => item.id === conversationId,
        );
        const latestMessage = messages[messages.length - 1];
        if (conversation && latestMessage && !conversation.lastMessage) {
          conversation.lastMessage = latestMessage.content;
          conversation.lastMessageTime = latestMessage.createdAt;
        }
      }
    },
    messageAdded(state, action: PayloadAction<MessageAddedPayload>) {
      const { conversationId, message, conversation } = action.payload;
      const messages = state.messages[conversationId] ?? [];
      if (messages.some((item) => item.id === message.id)) return;

      if (!state.conversations.some((item) => item.id === conversationId) && conversation) {
        state.conversations.unshift(conversation);
      }
      state.messages[conversationId] = [...messages, message];

      const existingConversation = state.conversations.find(
        (item) => item.id === conversationId,
      );
      if (existingConversation) {
        existingConversation.lastMessage = message.content;
        existingConversation.lastMessageTime = message.createdAt;
        if (!message.isMe && state.selectedId !== conversationId) {
          existingConversation.unreadCount =
            (existingConversation.unreadCount ?? 0) + 1;
        }
      }
    },
    messageRemoved(state, action: PayloadAction<{ conversationId: string; messageId: string }>) {
      const { conversationId, messageId } = action.payload;
      const messages = state.messages[conversationId] ?? [];
      state.messages[conversationId] = messages.filter(
        (message) => message.id !== messageId,
      );

      const conversation = state.conversations.find(
        (item) => item.id === conversationId,
      );
      const latestMessage = state.messages[conversationId].at(-1);
      if (conversation) {
        conversation.lastMessage = latestMessage?.content ?? "";
        conversation.lastMessageTime = latestMessage?.createdAt ?? "";
      }
    },
    loadMoreStarted(state) {
      state.isLoadingMore = true;
    },
    loadMoreFinished(state) {
      state.isLoadingMore = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearSession, () => initialState);
    builder.addCase(setSession, (state, action) => {
      if (state.owner && state.owner !== action.payload.user) {
        return {...initialState, owner: action.payload.user };
      }
      state.owner = action.payload.user;
    });
  },
});

export const {
  conversationRemoved,
  conversationSelected,
  conversationUpserted,
  conversationsLoaded,
  historyLoaded,
  loadMoreFinished,
  loadMoreStarted,
  messageAdded,
  messageRemoved,
} = chatSlice.actions;

export default chatSlice.reducer;
