import { useEffect, useState } from "react";
import Header from "../common/Header";
import SideBar from "./SideBar";
import ChatWindow from "./ChatWindow";
import EmptyChat from "./EmptyChat";
import CreateGroupModal from "./CreateGroupModal";
import { useAppSelector } from "../../hooks/useAppSelector";
import { useChatActions } from "../../hooks/useChatActions";
import { useChatListener } from "../../hooks/useChatListener";

export default function ChatInterface() {
  useChatListener();

  const user = useAppSelector((state) => state.auth.user);
  const {
    conversations,
    selectedId,
    messages,
    roomMembers,
    pagination,
    isLoadingMore,
  } = useAppSelector((state) => state.chat);
  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId,
  );
  const [activeTab, setActiveTab] = useState("messages");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isRoomInfoOpen, setIsRoomInfoOpen] = useState(false);

  const {
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
  } = useChatActions();

  useEffect(() => {
    if (user) void loadConversations(user);
  }, [loadConversations, user]);

  async function handleSelectConversation(conversationId: string) {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation) return;

    setIsRoomInfoOpen(false);
    try {
      await selectConversation(conversation);
    } catch (error) {
      console.error("Không thể tải lịch sử cuộc trò chuyện:", error);
    }
  }

  function handleStartDirectChat(username: string) {
    void startDirectChat(username).catch((error: unknown) => {
      console.error("Không thể mở cuộc trò chuyện:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể mở cuộc trò chuyện. Vui lòng thử lại.",
      );
    });
  }

  async function handleSendMessage(content: string) {
    if (!selectedConversation) return;
    try {
      await sendMessage(selectedConversation, content);
    } catch (error) {
      console.error("Gửi tin nhắn qua Socket thất bại:", error);
    }
  }

  async function handleCreateGroup(groupName: string) {
    try {
      await enterRoom(groupName, "create");
      setIsCreateGroupOpen(false);
    } catch (error: unknown) {
      alert(
        error instanceof Error
          ? error.message
          : "Tạo nhóm thất bại! Tên nhóm có thể đã tồn tại trên hệ thống.",
      );
    }
  }

  async function handleJoinGroup(groupName: string) {
    try {
      await enterRoom(groupName, "join");
      setIsCreateGroupOpen(false);
      return true;
    } catch (error: unknown) {
      alert(
        error instanceof Error
          ? error.message
          : "Tham gia phòng thất bại! Phòng có thể không tồn tại.",
      );
      return false;
    }
  }

  async function handleLeaveRoom() {
    if (!selectedConversation) return;
    try {
      if (await leaveRoom(selectedConversation)) setIsRoomInfoOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể rời phòng.");
    }
  }

  const currentMessages = selectedId ? messages[selectedId] ?? [] : [];
  const currentPagination = selectedId ? pagination[selectedId] : undefined;
  const currentRoomMembers = selectedId ? roomMembers[selectedId] ?? [] : [];

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
          key={selectedConversation.id}
          conversation={selectedConversation}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          onToggleInfo={() => {
            if (selectedConversation.type === "group") {
              setIsRoomInfoOpen((previous) => !previous);
            }
          }}
          isInfoOpen={isRoomInfoOpen}
          roomMembers={currentRoomMembers}
          onCloseInfo={() => setIsRoomInfoOpen(false)}
          onLeaveRoom={handleLeaveRoom}
          isLeavingRoom={isLeavingRoom}
          canLeaveRoom={true}
          onLoadMore={loadMoreMessages}
          hasMore={currentPagination?.hasMore ?? false}
          isLoadingMore={isLoadingMore}
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
