import { useState } from "react";
import type { Conversation } from "../types/chat";
import { createRoom, joinRoom, outRoom } from "../services/roomService";

interface UseChatRoomsOptions {
  addOrUpdateConversation: (conversation: Conversation) => void;
  removeConversation: (conversationId: string) => void;
  setSelectedId: (conversationId: string | null) => void;
  setRoomHistory: (
    roomName: string,
    messages: import("../types/chat").RoomChatMessage[],
    members?: import("../types/chat").RoomMember[],
  ) => void;
  removeMessageConversation: (conversationId: string, roomName?: string) => void;
  selectedConversation: Conversation | undefined;
}

export function useChatRooms({
  addOrUpdateConversation,
  removeConversation,
  setSelectedId,
  setRoomHistory,
  removeMessageConversation,
  selectedConversation,
}: UseChatRoomsOptions) {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const [isRoomInfoOpen, setIsRoomInfoOpen] = useState(false);

  async function createGroup(groupName: string) {
    setIsCreatingRoom(true);
    try {
      const room = await createRoom(groupName);
      const conversationId = `room-${room.name}`;
      const conversation: Conversation = {
        id: conversationId,
        name: room.name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(room.name)}`,
        type: "group",
        lastMessage: "Nhóm chat vừa được tạo. Hãy gửi lời chào!",
        lastMessageTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unreadCount: 0,
      };

      addOrUpdateConversation(conversation);
      setRoomHistory(
        room.name,
        room.chatData ?? room.chatMess ?? [],
        room.user ?? room.userList ?? [],
      );
      setSelectedId(conversationId);
      setIsCreateGroupOpen(false);
    } finally {
      setIsCreatingRoom(false);
    }
  }

  async function joinGroup(groupName: string) {
    setIsJoiningRoom(true);
    try {
      const room = await joinRoom(groupName);
      const conversationId = `room-${room.name}`;
      const history = room.chatData ?? room.chatMess ?? [];
      const conversation: Conversation = {
        id: conversationId,
        name: room.name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(room.name)}`,
        type: "group",
        lastMessage: history.length > 0
          ? history[history.length - 1].mes
          : "Bạn đã tham gia nhóm chat.",
        lastMessageTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unreadCount: 0,
      };

      addOrUpdateConversation(conversation);
      setRoomHistory(
        room.name,
        history,
        room.user ?? room.userList ?? [],
      );
      setSelectedId(conversationId);
      setIsCreateGroupOpen(false);
    } finally {
      setIsJoiningRoom(false);
    }
  }

  async function leaveRoom() {
    if (!selectedConversation || selectedConversation.type !== "group") return;

    if (!window.confirm(`Bạn có chắc muốn rời phòng "${selectedConversation.name}"?`)) {
      return;
    }

    setIsLeavingRoom(true);
    try {
      await outRoom(selectedConversation.name);
      removeConversation(selectedConversation.id);
      removeMessageConversation(selectedConversation.id, selectedConversation.name);
      setSelectedId(null);
      setIsRoomInfoOpen(false);
    } finally {
      setIsLeavingRoom(false);
    }
  }

  return {
    isCreateGroupOpen,
    setIsCreateGroupOpen,
    isCreatingRoom,
    isJoiningRoom,
    isLeavingRoom,
    isRoomInfoOpen,
    setIsRoomInfoOpen,
    createGroup,
    joinGroup,
    leaveRoom,
  };
}
