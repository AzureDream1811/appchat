import type {
  PeopleChatHistory,
  PeopleChatMessages,
} from "../types/chat";
import type { HistoryPayload, SendChatPayload } from "../types/ws";
import { socket } from "./socket";

export async function sendChatMessage(
  type: "room" | "people",
  targetName: string,
  messageContent: string
): Promise<void> {
  const request: SendChatPayload = {
    type,
    to: targetName,
    mes: messageContent.trim(),
  };

  const sent = await socket.send("SEND_CHAT", request);
  if (!sent) {
    throw new Error("Không thể gửi tin nhắn qua Socket.");
  }
}

export async function getDirectChatMessages(
  username: string,
  page = 1,
): Promise<PeopleChatMessages> {
  const request: HistoryPayload = {
    name: username,
    page,
  };

  const response = await socket.request<PeopleChatMessages | PeopleChatHistory>(
    "GET_PEOPLE_CHAT_MES",
    request,
  );

  if (Array.isArray(response)) {
    return response;
  }

  return response.chatData ?? response.chatMess ?? [];
}