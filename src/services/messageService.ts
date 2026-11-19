import type {
  GetPeopleChatMessagesRequestDto,
  GetPeopleChatMessagesResponseDto,
  SendChatRequestDto,
} from "../api/events/messageApi";
import {
  sendSocketEvent,
  sendSocketMessage,
} from "../api/websocketClient";

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

  await sendSocketEvent("SEND_CHAT", request);
}

export async function getPeopleChatMessages(
  username: string,
  page = 1,
): Promise<GetPeopleChatMessagesResponseDto> {
  const request: GetPeopleChatMessagesRequestDto = {
    name: username,
    page,
  };

  return await sendSocketMessage<GetPeopleChatMessagesResponseDto>(
    "GET_PEOPLE_CHAT_MES",
    request,
  );
}