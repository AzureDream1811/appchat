import { useState, useRef, useEffect } from "react";
import SidebarNav from "../components/chat/SidebarNav";
import ConversationList from "../components/chat/ConversationList";
import ChatArea from "../components/chat/ChatArea";
import EmptyChat from "../components/chat/EmptyChat";
import type { Message } from "../types/chat";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import CreateGroupModal from "../components/chat/CreateGroupModal";
import {
  createRoom,
  getRoomChatMessages,
  joinRoom,
  outRoom,
} from "../services/roomService";
import type { Conversation } from "../types/chat";
import type { RoomMemberDto } from "../api/events/roomApi";
import {
  getPeopleChatMessages,
  sendChatMessage,
} from "../services/messageService";
import { getUserList } from "../services/userService";
import { subscribeSocketEvent } from "../api/websocketClient";
import { useNavigate } from "react-router-dom";
import { relogin } from "../state/authSlice";
import { isSocketAuthenticated } from "../api/websocketClient";

export default function ChatPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.auth.session);
  const myName = session?.username ?? "Tôi";
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState("messages");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const currentMessages = selectedId ? messages[selectedId] ?? [] : [];
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [chatPages, setChatPages] = useState<Record<string, number>>({});
  const [chatHasMore, setChatHasMore] = useState<Record<string, boolean>>({});
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomMembers, setRoomMembers] = useState<Record<string, RoomMemberDto[]>>({});
  const [isRoomInfoOpen, setIsRoomInfoOpen] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    async function initChatSession() {
      if (!session) {
        navigate("/login");
        return;
      }

      try {
        setIsInitializing(true);

        if (!isSocketAuthenticated()) {
          console.log("[ChatPage] Phát hiện reload trang, đang tự động kết nối lại (RE_LOGIN)...");
          await dispatch(relogin()).unwrap();
          console.log("[ChatPage] RE_LOGIN thành công!");
        }

        const userList = await getUserList();
        const conversationList = userList.map((item) => {
          const isRoom = item.type === 1;

          return {
            id: isRoom ? `room-${item.name}` : `user-${item.name}`,
            name: item.name,
            avatar: `https://api.dicebear.com/7.x/${isRoom ? "bottts" : "avataaars"
              }/svg?seed=${encodeURIComponent(item.name)}`,
            type: isRoom ? ("group" as const) : ("direct" as const),
            lastMessage: "",
            lastMessageTime: item.actionTime,
            unreadCount: 0,
            isOnline: false,
          };
        });

        setConversations(conversationList);
      } catch (error) {
        console.error("Khởi tạo phiên chat thất bại:", error);
        alert("Phiên đăng nhập đã hết hạn hoặc server khởi động lại. Vui lòng đăng nhập lại.");
        navigate("/login");
      } finally {
        setIsInitializing(false);
      }
    }

    void initChatSession();
  }, [session, dispatch, navigate]);

  useEffect(() => {
    const unsubscribe = subscribeSocketEvent((response) => {
      if (response.event === "SEND_CHAT" && response.status === "success") {
        const data = response.data;
        if (!data) return;
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

        setConversations(
          (prev) =>
            prev.map((c) =>
              c.id === targetRoomId
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

  async function loadRoomChat(roomName: string, page = 1) {
    const roomId = `room-${roomName}`;
    try {
      const response = await getRoomChatMessages(roomName, page);
      const members = response.user ?? response.userList ?? [];
      const history = response.chatMess ?? response.chatData ?? [];
      setRoomMembers((previous) => ({
        ...previous,
        [roomName]: members,
      }));
      const mappedMessages: Message[] = history.map((item) => ({
        id: `msg-${item.id}`,
        conversationId: roomId,
        senderName: item.name,
        content: item.mes,
        createdAt: item.createAt,
        isMe: item.name === myName,
      }));
      if (page === 1) {
        setMessages((prev) => ({
          ...prev,
          [roomId]: mappedMessages,
        }));
      } else {
        setMessages((prev) => ({
          ...prev,
          [roomId]: [...mappedMessages, ...(prev[roomId] ?? [])],
        }));
      }
      setChatPages((prev) => ({ ...prev, [roomId]: page }));
      setChatHasMore((prev) => ({ ...prev, [roomId]: history.length >= 50 }));
    } catch (error) {
      console.error("Không thể tải dữ liệu phòng:", error);
    }
  }

  async function handleSelectConversation(conversationId: string) {
    setSelectedId(conversationId);
    setIsRoomInfoOpen(false);
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );

    const conversation = conversations.find(
      (item) => item.id === conversationId,
    );

    if (!conversation) {
      return;
    }

    if (conversation.type === "group") {
      await loadRoomChat(conversation.name, 1);
      return;
    }

    try {
      const history = await getPeopleChatMessages(conversation.name, 1);
      const conversationMessages = history.map((item) => ({
        id: `msg-${item.id}`,
        conversationId,
        senderName: item.name,
        content: item.mes,
        createdAt: item.createAt,
        isMe: item.name === myName,
      }));

      setMessages((previous) => ({
        ...previous,
        [conversationId]: conversationMessages,
      }));
      setChatPages((prev) => ({ ...prev, [conversationId]: 1 }));
      setChatHasMore((prev) => ({ ...prev, [conversationId]: history.length >= 50 }));
    } catch (error) {
      console.error("Không thể tải lịch sử cuộc trò chuyện:", error);
    }
  }

  async function handleLoadMoreMessages() {
    if (!selectedId || !selectedConversation || isLoadingOlderMessages) return;

    const currentPage = chatPages[selectedId] ?? 1;
    const hasMore = chatHasMore[selectedId] ?? false;
    if (!hasMore) return;

    const nextPage = currentPage + 1;
    setIsLoadingOlderMessages(true);

    try {
      if (selectedConversation.type === "group") {
        await loadRoomChat(selectedConversation.name, nextPage);
      } else {
        const history = await getPeopleChatMessages(selectedConversation.name, nextPage);
        const olderMessages = history.map((item) => ({
          id: `msg-${item.id}`,
          conversationId: selectedId,
          senderName: item.name,
          content: item.mes,
          createdAt: item.createAt,
          isMe: item.name === myName,
        }));

        setMessages((prev) => ({
          ...prev,
          [selectedId]: [...olderMessages, ...(prev[selectedId] ?? [])],
        }));

        setChatPages((prev) => ({ ...prev, [selectedId]: nextPage }));
        setChatHasMore((prev) => ({ ...prev, [selectedId]: history.length >= 50 }));
      }
    } catch (error) {
      console.error("Không thể tải thêm tin nhắn cũ:", error);
    } finally {
      setIsLoadingOlderMessages(false);
    }
  }

  function handleStartDirectChat(username: string) {
    setConversations((prev) => {
      const conversationId = `user-${username}`;

      if (prev.some((c) => c.id === conversationId)) {
        setSelectedId(conversationId);
        return prev;
      }

      return [
        {
          id: conversationId,
          name: username,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
          type: "direct",
          lastMessage: "",
          lastMessageTime: "",
          unreadCount: 0,
          isOnline: false,
        },
        ...prev,
      ];
    });

    setMessages((prev) => {
      const conversationId = `user-${username}`;

      if (prev[conversationId]) {
        return prev;
      }

      return {
        ...prev,
        [conversationId]: [],
      };
    });

    setSelectedId(`user-${username}`);
  }

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
      setRoomMembers((previous) => ({
        ...previous,
        [response.name]: response.user ?? response.userList ?? [],
      }));
      setSelectedId(newRoomId);

      setIsCreateGroupOpen(false);
    } catch (error: unknown) {
      alert(
        error instanceof Error
          ? error.message
          : "Tạo nhóm thất bại! Tên nhóm có thể đã tồn tại trên hệ thống.",
      );
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
      setRoomMembers((previous) => ({
        ...previous,
        [response.name]: response.user ?? response.userList ?? [],
      }));

      setSelectedId(targetRoomId);
      setIsCreateGroupOpen(false);
    } catch (error: unknown) {
      alert(
        error instanceof Error
          ? error.message
          : "Tham gia phòng thất bại! Phòng có thể không tồn tại.",
      );
    } finally {
      setIsJoiningRoom(false);
    }
  }

  async function handleLeaveRoom() {
    if (!selectedConversation || selectedConversation.type !== "group") {
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn rời phòng "${selectedConversation.name}"?`,
    );
    if (!confirmed) return;

    setIsLeavingRoom(true);
    try {
      await outRoom(selectedConversation.name);

      setConversations((previous) =>
        previous.filter(
          (conversation) => conversation.id !== selectedConversation.id,
        ),
      );
      setMessages((previous) => {
        const next = { ...previous };
        delete next[selectedConversation.id];
        return next;
      });
      setRoomMembers((previous) => {
        const next = { ...previous };
        delete next[selectedConversation.name];
        return next;
      });
      setSelectedId(null);
      setIsRoomInfoOpen(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Không thể rời phòng.",
      );
    } finally {
      setIsLeavingRoom(false);
    }
  }
  if (isInitializing) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-10 h-10 border-4 border-[#0068ff] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 text-sm font-medium">Đang kết nối lại phiên trò chuyện...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white select-none">
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelectConversation={handleSelectConversation}

        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
        onStartDirectChat={handleStartDirectChat}
        onJoinRoom={handleJoinGroup}
      />

      {selectedConversation ? (
        <ChatArea
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
          onLoadMore={handleLoadMoreMessages}
          hasMore={selectedId ? chatHasMore[selectedId] ?? false : false}
          isLoadingMore={isLoadingOlderMessages}
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