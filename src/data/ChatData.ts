import type { Conversation, Message } from "../types/chat";

export const initialConversations: Conversation[] = [
  {
    id: "group-1",
    name: "Nhóm Dự Án AppChat",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AppChat",
    type: "group",
    lastMessage: "Hôm nay hoàn thành xong giao diện nhắn tin nhé cả nhóm!",
    lastMessageTime: "15:30",
    unreadCount: 3,
  },
  {
    id: "user-1",
    name: "Thầy Hướng Dẫn",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher",
    type: "direct",
    lastMessage: "Em kiểm tra lại tài liệu WebSocket thầy vừa gửi nhé.",
    lastMessageTime: "14:15",
    isOnline: true,
  },
  {
    id: "user-2",
    name: "Nguyễn Văn Hải",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hai",
    type: "direct",
    lastMessage: "Tối nay có làm tiếp phần gửi ảnh không bạn?",
    lastMessageTime: "Hôm qua",
    isOnline: false,
  },
  {
    id: "group-2",
    name: "Hội Bạn Thân NLU ",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Friends",
    type: "group",
    lastMessage: "Cuối tuần đi cafe học nhóm đi mọi người ơi!",
    lastMessageTime: "Thứ 6",
  },
];

export const initialMessages: Record<string, Message[]> = {
  "group-1": [
    {
      id: "m-1",
      conversationId: "group-1",
      senderName: "Thầy Hướng Dẫn",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher",
      content: "Chào cả nhóm, các em đã kết nối được WebSocket chưa?",
      createdAt: "15:20",
      isMe: false,
    },
    {
      id: "m-2",
      conversationId: "group-1",
      senderName: "Tôi",
      content: "Dạ nhóm em đã hoàn thành xong phần Đăng nhập rồi ạ!",
      createdAt: "15:25",
      isMe: true,
    },
    {
      id: "m-3",
      conversationId: "group-1",
      senderName: "Nguyễn Văn Hải",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hai",
      content: "Hôm nay hoàn thành xong giao diện nhắn tin nhé cả nhóm!",
      createdAt: "15:30",
      isMe: false,
    },
  ],
};