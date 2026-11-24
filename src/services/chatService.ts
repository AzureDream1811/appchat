import type {
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

  await socket.send("SEND_CHAT", request);
}

export async function getDirectChatMessages(
  username: string,
  page = 1,
): Promise<PeopleChatMessages> {
  const request: HistoryPayload = {
    name: username,
    page,
  };

  return await socket.request<PeopleChatMessages>(
    "GET_PEOPLE_CHAT_MES",
    request,
  );
}