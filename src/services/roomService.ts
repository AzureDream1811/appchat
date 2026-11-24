import type {
  CreateRoomRequestDto,
  CreateRoomResponseDataDto,
  GetRoomChatMessagesRequestDto,
  GetRoomChatMessagesResponseDataDto,
  JoinRoomRequestDto,
  JoinRoomResponseDataDto,
  OutRoomRequestDto,
  OutRoomResponseDataDto,
} from "../types/chat";
import { socket } from "./socket";

export async function createRoom(
  roomName: string,
): Promise<CreateRoomResponseDataDto> {
  const request: CreateRoomRequestDto = {
    name: roomName.trim(),
  };

  return await socket.request<CreateRoomResponseDataDto>(
    "CREATE_ROOM",
    request,
  );
}

export async function joinRoom(
  roomName: string,
): Promise<JoinRoomResponseDataDto> {
  const request: JoinRoomRequestDto = {
    name: roomName.trim(),
  };

  return await socket.request<JoinRoomResponseDataDto>("JOIN_ROOM", request);
}

export async function outRoom(
  roomName: string,
): Promise<OutRoomResponseDataDto> {
  const request: OutRoomRequestDto = {
    name: roomName.trim(),
  };

  return await socket.request<OutRoomResponseDataDto>("OUT_ROOM", request);
}

export async function getRoomChatMessages(
  roomName: string,
  page = 1,
): Promise<GetRoomChatMessagesResponseDataDto> {
  const request: GetRoomChatMessagesRequestDto = {
    name: roomName.trim(),
    page,
  };

  return await socket.request<GetRoomChatMessagesResponseDataDto>(
    "GET_ROOM_CHAT_MES",
    request,
  );
}
