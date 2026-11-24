import { useState } from "react";
import Header from "../common/Header";
import SideBar from "./SideBar";
import ChatWindow from "./ChatWindow";
import EmptyChat from "./EmptyChat";
import CreateGroupModal from "./CreateGroupModal";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useChatConversations } from "../../hooks/useChatConversations";
import { useChatMessages } from "../../hooks/useChatMessages";
import { useChatRooms } from "../../hooks/useChatRooms";

export default function ChatInterface() {
  const user = useAppSelector((state) => state.auth.user);
  const myName = user ?? "Tôi";
  const [activeTab, setActiveTab] = useState("messages");

  const {
    conversations,
    selectedId,
    selectedConversation,
    setSelectedId,
    updateConversation,
    removeConversation,
    addOrUpdateConversation,
    startDirectChat,
  } = useChatConversations(user);

  const {
    currentMessages,
    roomMembers,
    setRoomHistory,
    ensureDirectConversation,
    selectConversation,
    sendMessage,
    removeConversation: removeMessageConversation,
  } = useChatMessages(myName, selectedId, selectedConversation);

  const {
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
  } = useChatRooms({
    addOrUpdateConversation,
    removeConversation,
    setSelectedId,
    setRoomHistory,
    removeMessageConversation,
    selectedConversation,
  });

  async function handleSelectConversation(conversationId: string) {
    setSelectedId(conversationId);
    setIsRoomInfoOpen(false);
    updateConversation(conversationId, { unreadCount: 0 });

    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation) return;

    try {
      await selectConversation(conversation);
    } catch (error) {
      console.error("Không thể tải lịch sử cuộc trò chuyện:", error);
    }
  }

  function handleStartDirectChat(username: string) {
    startDirectChat(username);
    ensureDirectConversation(`user-${username}`);
  }

  async function handleSendMessage(content: string) {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Gửi tin nhắn qua Socket thất bại:", error);
    }
  }

  async function handleCreateGroup(groupName: string) {
    try {
      await createGroup(groupName);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Tạo nhóm thất bại! Tên nhóm có thể đã tồn tại trên hệ thống.",
      );
    }
  }

  async function handleJoinGroup(groupName: string) {
    try {
      await joinGroup(groupName);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Tham gia phòng thất bại! Phòng có thể không tồn tại.",
      );
    }
  }

  async function handleLeaveRoom() {
    try {
      await leaveRoom();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể rời phòng.");
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white select-none">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <SideBar
        conversations={conversations}
        selectedId={selectedId}
        onSelectConversation={handleSelectConversation}
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        onStartDirectChat={handleStartDirectChat}
        onJoinRoom={handleJoinGroup}
      />

      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          onToggleInfo={() => {
            if (selectedConversation.type === "group") {
              setIsRoomInfoOpen((previous) => !previous);
            }
          }}
          isInfoOpen={isRoomInfoOpen}
          roomMembers={
            selectedConversation.type === "group"
              ? roomMembers[selectedConversation.name] ?? []
              : []
          }
          onCloseInfo={() => setIsRoomInfoOpen(false)}
          onLeaveRoom={handleLeaveRoom}
          isLeavingRoom={isLeavingRoom}
          canLeaveRoom={true}
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
