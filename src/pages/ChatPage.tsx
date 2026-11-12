import { useState } from "react";
import SidebarNav from "../components/chat/SidebarNav";
import ConversationList from "../components/chat/ConversationList";
import ChatArea from "../components/chat/ChatArea";
import EmptyChat from "../components/chat/EmptyChat";
import { initialConversations, initialMessages } from "../data/ChatData";
import type { Message } from "../types/chat";
import { useAppSelector } from "../hooks/redux";
import CreateGroupModal from "../components/chat/CreateGroupModal";
import { createRoom, joinRoom } from "../services/roomService";
import type { Conversation } from "../types/chat";
import { useEffect } from "react";
import { sendChatMessage } from "../services/messageService";
import { subscribeSocketEvent } from "../api/websocketClient";

export default function ChatPage() {
  const session = useAppSelector((state) => state.auth.session);
  const myName = session?.username ?? "Tôi";
  const [activeTab, setActiveTab] = useState("messages");
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>("group-1");
  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const currentMessages = selectedId ? messages[selectedId] ?? [] : [];
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSocketEvent((response) => {
      if (response.event === "SEND_CHAT" && response.status === "success") {
        const data = response.data;
        if (data.name === myName) return;
        const isRoom = data.type === 1;
        const targetRoomId = isRoom ? `room-${data.to}` : `user-${data.name}`;
        const incomingMessage: Message = {
          id: `msg-${Date.now()}-${Math.random()}`,
          conversationId: targetRoomId,
          senderName: data.name,
          content: data.mes,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
        };

        setMessages((prev) => ({
          ...prev,
          [targetRoomId]: [...(prev[targetRoomId] ?? []), incomingMessage],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetRoomId || c.name === data.to || c.name === data.name
              ? {
                ...c,
                lastMessage: data.mes,
                lastMessageTime: incomingMessage.createdAt,
              }
              : c
          )
        );
      }
    });

    return () => unsubscribe();
  }, [myName]);
  async function handleSendMessage(content: string) {
    if (!selectedId || !selectedConversation) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedId,
      senderName: myName,
      content: content,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };
    setMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), newMessage],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
            ...c,
            lastMessage: content,
            lastMessageTime: newMessage.createdAt,
          }
          : c
      )
    );
    try {
      const isRoom = selectedConversation.type === "group";
      const targetType = isRoom ? "room" : "people";
      await sendChatMessage(targetType, selectedConversation.name, content);
    } catch (error) {
      console.error("Gửi tin nhắn qua Socket thất bại:", error);
    }
  }
  async function handleCreateGroup(groupName: string) {
    try {
      setIsCreatingRoom(true);

      const response = await createRoom(groupName);

      const newRoomId = `room-${response.name}`;
      const newRoom: Conversation = {
        id: newRoomId,
        name: response.name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(response.name)}`,
        type: "group",
        lastMessage: "Nhóm chat vừa được tạo. Hãy gửi lời chào!",
        lastMessageTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        unreadCount: 0,
      };

      setConversations((prev) => [newRoom, ...prev]);
      const rawMessages = response.chatData || response.chatMess || [];
      setMessages((prev) => ({
        ...prev,
        [newRoomId]: rawMessages.map((msg) => ({
          id: `msg-${msg.id}`,
          conversationId: newRoomId,
          senderName: msg.name,
          content: msg.mes,
          createdAt: msg.createAt,
          isMe: msg.name === myName,
        })),
      }));
      setSelectedId(newRoomId);

      setIsCreateGroupOpen(false);
    } catch (error: any) {
      alert(error.message || "Tạo nhóm thất bại! Tên nhóm có thể đã tồn tại trên hệ thống.");
    } finally {
      setIsCreatingRoom(false);
    }
  }
  async function handleJoinGroup(groupName: string) {
    try {
      setIsJoiningRoom(true);

      const response = await joinRoom(groupName);

      const targetRoomId = `room-${response.name}`;
      const rawMessages = response.chatData || response.chatMess || [];

      const joinedRoom: Conversation = {
        id: targetRoomId,
        name: response.name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(response.name)}`,
        type: "group",
        lastMessage:
          rawMessages.length > 0
            ? rawMessages[rawMessages.length - 1].mes
            : "Bạn đã tham gia nhóm chat.",
        lastMessageTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unreadCount: 0,
      };

      setConversations((prev) => {
        const exists = prev.some((c) => c.name.toLowerCase() === response.name.toLowerCase());
        if (exists) return prev;
        return [joinedRoom, ...prev];
      });

      setMessages((prev) => ({
        ...prev,
        [targetRoomId]: rawMessages.map((msg) => ({
          id: `msg-${msg.id}`,
          conversationId: targetRoomId,
          senderName: msg.name,
          content: msg.mes,
          createdAt: msg.createAt,
          isMe: msg.name === myName,
        })),
      }));

      setSelectedId(targetRoomId);
      setIsCreateGroupOpen(false);
    } catch (error: any) {
      alert(error.message || "Tham gia phòng thất bại! Phòng có thể không tồn tại.");
    } finally {
      setIsJoiningRoom(false);
    }
  }
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white select-none">
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelectConversation={(id) => {
          setSelectedId(id);
          setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
          );
        }}

        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
      />

      {selectedConversation ? (
        <ChatArea
          conversation={selectedConversation}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          onToggleInfo={() => alert("Mở thông tin hội thoại!")}
        />
      ) : (
        <EmptyChat />
      )}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
        onJoinGroup={handleJoinGroup}
        loading={isCreatingRoom || isJoiningRoom}
      />
    </div>
  );
}