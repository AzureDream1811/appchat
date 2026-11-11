import type { SendChatRequestDto } from "../api/events/messageApi";
import { sendSocketEvent } from "../api/websocketClient";

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