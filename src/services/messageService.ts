import type {
  GetPeopleChatMessagesRequestDto,
  GetPeopleChatMessagesResponseDto,
  SendChatRequestDto,
} from "../types/chat";
import { socket } from "./socket";

export async function sendChatMessage(
  type: "room" | "people",
  targetName: string,
  messageContent: string
): Promise<void> {
  const request: SendChatRequestDto = {
    type,
    to: targetName,
    mes: messageContent.trim(),
  };

  await socket.send("SEND_CHAT", request);
}

export async function getPeopleChatMessages(
  username: string,
  page = 1,
): Promise<GetPeopleChatMessagesResponseDto> {
  const request: GetPeopleChatMessagesRequestDto = {
    name: username,
    page,
  };

  return await socket.request<GetPeopleChatMessagesResponseDto>(
    "GET_PEOPLE_CHAT_MES",
    request,
  );
}