import { useState } from "react";
import SidebarNav from "../components/chat/SidebarNav";
import ConversationList from "../components/chat/ConversationList";
import ChatArea from "../components/chat/ChatArea";
import EmptyChat from "../components/chat/EmptyChat";
import { initialConversations, initialMessages } from "../data/ChatData";
import type { Message } from "../types/chat";
import { useAppSelector } from "../hooks/redux";

export default function ChatPage() {
  const session = useAppSelector((state) => state.auth.session);
  const myName = session?.username ?? "Tôi";
  const [activeTab, setActiveTab] = useState("messages");
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>("group-1");
  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const currentMessages = selectedId ? messages[selectedId] ?? [] : [];

  function handleSendMessage(content: string) {
    if (!selectedId) return;

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
        onOpenCreateGroup={() => alert("Tính năng tạo nhóm sẽ kết nối với API CREATE_ROOM!")}
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
    </div>
  );
}