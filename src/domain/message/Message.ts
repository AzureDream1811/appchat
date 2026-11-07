export interface Message {
  id: string;
  senderId: string;
  targetId: string;
  targetType: "direct" | "room";
  content: string;
  type: "chat" | "sticker" | "attachment";
  attachments?: string[];
  createdAt: string;
}
