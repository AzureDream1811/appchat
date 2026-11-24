import type {
  RoomResponse,
  RoomChatHistory,
  OutRoomResponse,
} from "../types/chat";
import type { HistoryPayload, RoomNamePayload } from "../types/ws";
import { socket } from "./socket";

export async function createRoom(
  roomName: string,
): Promise<RoomResponse> {
  const request: RoomNamePayload = {
    name: roomName.trim(),
  };

  return await socket.request<RoomResponse>(
    "CREATE_ROOM",
    request,
  );
}

export async function joinRoom(
  roomName: string,
): Promise<RoomResponse> {
  const request: RoomNamePayload = {
    name: roomName.trim(),
  };

  return await socket.request<RoomResponse>("JOIN_ROOM", request);
}

export async function outRoom(
  roomName: string,
): Promise<OutRoomResponse> {
  const request: RoomNamePayload = {
    name: roomName.trim(),
  };

  return await socket.request<OutRoomResponse>("OUT_ROOM", request);
}

export async function getRoomChatMessages(
  roomName: string,
  page = 1,
): Promise<RoomChatHistory> {
  const request: HistoryPayload = {
    name: roomName.trim(),
    page,
  };

  return await socket.request<RoomChatHistory>(
    "GET_ROOM_CHAT_MES",
    request,
  );
}
