import { useCallback, useRef, useState } from "react";
import type {
  Conversation,
  Message,
  PeopleChatMessage,
  RoomChatMessage,
  RoomMember,
} from "../types/chat";
import { useAppDispatch } from "./useAppDispatch";
import { useAppSelector } from "./useAppSelector";
import {
  conversationRemoved,
  conversationSelected,
  conversationUpserted,
  conversationsLoaded,
  historyLoaded,
  loadMoreFinished,
  loadMoreStarted,
  messageAdded,
  messageRemoved,
} from "../store/slices/chatSlice";
import {
  getDirectChatMessages,
  sendChatMessage,
} from "../services/chatService";
import {
  createRoom,
  getRoomChatMessages,
  joinRoom,
  outRoom,
} from "../services/roomService";
import { getUserList } from "../services/userService";
import {
  createDirectConversation,
  createMessageId,
  formatChatTime,
  getConversationId,
} from "../utils/chatMessage";


type HistoryMessage = PeopleChatMessage | RoomChatMessage;

function mapHistory(
  history: HistoryMessage[],
  conversationId: string,
  username: string,
): Message[] {
  return [...history]
    .sort((a, b) => a.id - b.id)
    .map((message) => ({
      id: createMessageId(message.id),
      conversationId,
      senderName: message.name,
      content: message.mes,
      createdAt: formatChatTime(message.createAt),
      isMe: message.name === username,
    }));
}

export function useChatActions() {
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.auth.user) ?? "Tôi";
  const { conversations, selectedId, pagination, isLoadingMore } =
    useAppSelector((state) => state.chat);
  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId,
  );
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const loadingMoreRef = useRef(false);

  const loadConversations = useCallback(
    async (user: string) => {
      try {
        const userList = await getUserList();
        const currentUser = user.trim().toLocaleLowerCase();
        const seen = new Set<string>();
        const loaded = userList.flatMap((item) => {
          const name = item.name.trim();
          const normalizedName = name.toLocaleLowerCase();
          const key = `${item.type}:${normalizedName}`;
          if (!name || normalizedName === currentUser || seen.has(key))
            return [];
          seen.add(key);

          const isRoom = item.type === 1;
          return [
            {
              id: getConversationId(isRoom ? "group" : "direct", name),
              name,
              avatar: `https://api.dicebear.com/7.x/${
                isRoom ? "bottts" : "avataaars"
              }/svg?seed=${encodeURIComponent(name)}`,
              type: isRoom ? ("group" as const) : ("direct" as const),
              lastMessage: "",
              lastMessageTime: item.actionTime
                ? formatChatTime(item.actionTime)
                : "",
              unreadCount: 0,
              isOnline: false,
            },
          ];
        });

        dispatch(conversationsLoaded(loaded));
      } catch (error) {
        console.error("Không thể tải danh sách conversation:", error);
      }
    },
    [dispatch],
  );

  const selectConversation = useCallback(
    async (conversation: Conversation) => {
      dispatch(conversationSelected(conversation.id));
      if (pagination[conversation.id]) return;

      if (conversation.type === "group") {
        const response = await getRoomChatMessages(conversation.name, 1);
        const history = response.chatMess ?? response.chatData ?? [];
        dispatch(
          historyLoaded({
            conversationId: conversation.id,
            messages: mapHistory(history, conversation.id, username),
            page: 1,
            hasMore: history.length >= 0,
            roomMembers: response.user ?? response.userList ?? [],
          }),
        );
        return;
      }

      const history = await getDirectChatMessages(conversation.name, 1);
      dispatch(
        historyLoaded({
          conversationId: conversation.id,
          messages: mapHistory(history, conversation.id, username),
          page: 1,
          hasMore: history.length >= 0,
        }),
      );
    },
    [dispatch, pagination, username],
  );

  const startDirectChat = useCallback(
    async (name: string) => {
      const trimmed = name.trim();

      if (trimmed.toLowerCase() === username.toLowerCase()) {
        throw new Error("Bạn không thể tự nhắn tin cho chính mình.");
      }

      const existing = conversations.find(
        (item) =>
          item.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase() &&
          item.type === "direct",
      );

      const conversation = existing ?? createDirectConversation(trimmed);
      if (!existing) dispatch(conversationUpserted(conversation));
      await selectConversation(conversation);
    },
    [conversations, dispatch, selectConversation, username],
  );

  const loadMoreMessages = useCallback(async () => {
    if (
      !selectedId ||
      !selectedConversation ||
      isLoadingMore ||
      loadingMoreRef.current
    ) {
      return;
    }

    const currentPage = pagination[selectedId];
    if (!currentPage?.hasMore) return;

    const nextPage = currentPage.page + 1;
    loadingMoreRef.current = true;
    dispatch(loadMoreStarted());
    try {
      if (selectedConversation.type === "group") {
        const response = await getRoomChatMessages(
          selectedConversation.name,
          nextPage,
        );
        const history = response.chatMess ?? response.chatData ?? [];
        
        dispatch(
          historyLoaded({
            conversationId: selectedId,
            messages: mapHistory(history, selectedId, username),
            page: nextPage,
            hasMore: history.length >= 0,
            roomMembers: response.user ?? response.userList ?? [],
          }),
        );
      } else {
        const history = await getDirectChatMessages(
          selectedConversation.name,
          nextPage,
        );
        dispatch(
          historyLoaded({
            conversationId: selectedId,
            messages: mapHistory(history, selectedId, username),
            page: nextPage,
            hasMore: history.length >= 0,
          }),
        );
      }
    } finally {
      loadingMoreRef.current = false;
      dispatch(loadMoreFinished());
    }
  }, [
    dispatch,
    isLoadingMore,
    pagination,
    selectedConversation,
    selectedId,
    username,
  ]);

  const sendMessage = useCallback(
    async (conversation: Conversation, content: string) => {
      const message: Message = {
        id: createMessageId(),
        conversationId: conversation.id,
        senderName: username,
        content,
        createdAt: formatChatTime(),
        isMe: true,
      };
      dispatch(messageAdded({ conversationId: conversation.id, message }));

      try {
        await sendChatMessage(
          conversation.type === "group" ? "room" : "people",
          conversation.name,
          content,
        );
      } catch (error) {
        dispatch(
          messageRemoved({
            conversationId: conversation.id,
            messageId: message.id,
          }),
        );
        throw error;
      }
    },
    [dispatch, username],
  );

  const enterRoom = useCallback(
    async (roomName: string, operation: "create" | "join") => {
      const isCreating = operation === "create";
      if (isCreating) setIsCreatingRoom(true);
      else setIsJoiningRoom(true);

      try {
        const room = isCreating
          ? await createRoom(roomName)
          : await joinRoom(roomName);
        const conversationId = getConversationId("group", room.name);
        const history = room.chatData ?? room.chatMess ?? [];
        const messages = mapHistory(history, conversationId, username);
        const members: RoomMember[] = room.user ?? room.userList ?? [];
        const conversation: Conversation = {
          id: conversationId,
          name: room.name,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(room.name)}`,
          type: "group",
          lastMessage:
            messages.at(-1)?.content ??
            (isCreating
              ? "Nhóm chat vừa được tạo. Hãy gửi lời chào!"
              : "Bạn đã tham gia nhóm chat."),
          lastMessageTime: messages.at(-1)
            ? messages.at(-1)?.createdAt
            : formatChatTime(),
          unreadCount: 0,
        };

        dispatch(conversationUpserted(conversation));
        dispatch(
          historyLoaded({
            conversationId,
            messages,
            page: 1,
            hasMore: history.length >= 0,
            roomMembers: members,
          }),
        );
        dispatch(conversationSelected(conversationId));
      } finally {
        if (isCreating) setIsCreatingRoom(false);
        else setIsJoiningRoom(false);
      }
    },
    [dispatch, username],
  );

  const leaveRoom = useCallback(
    async (conversation: Conversation) => {
      if (conversation.type !== "group") return false;
      if (
        !window.confirm(`Bạn có chắc muốn rời phòng "${conversation.name}"?`)
      ) {
        return false;
      }

      setIsLeavingRoom(true);
      try {
        await outRoom(conversation.name);
        dispatch(conversationRemoved(conversation.id));
        return true;
      } finally {
        setIsLeavingRoom(false);
      }
    },
    [dispatch],
  );

  return {
    enterRoom,
    isCreatingRoom,
    isJoiningRoom,
    isLeavingRoom,
    leaveRoom,
    loadConversations,
    loadMoreMessages,
    selectConversation,
    sendMessage,
    startDirectChat,
  };
}
