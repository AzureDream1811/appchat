import type {
  CreateRoomRequestDto,
  CreateRoomResponseDataDto,
  JoinRoomRequestDto,
  JoinRoomResponseDataDto,
  OutRoomRequestDto,
  OutRoomResponseDataDto,
} from "../api/events/roomApi";
import { sendSocketMessage } from "../api/websocketClient";


export async function createRoom(roomName: string): Promise<CreateRoomResponseDataDto> {
  const request: CreateRoomRequestDto = {
    name: roomName.trim(),
  };

  return await sendSocketMessage<CreateRoomResponseDataDto>("CREATE_ROOM", request);
}


export async function joinRoom(roomName: string): Promise<JoinRoomResponseDataDto> {
  const request: JoinRoomRequestDto = {
    name: roomName.trim(),
  };

  return await sendSocketMessage<JoinRoomResponseDataDto>("JOIN_ROOM", request);
}


export async function outRoom(roomName: string): Promise<OutRoomResponseDataDto> {
  const request: OutRoomRequestDto = {
    name: roomName.trim(),
  };

  return await sendSocketMessage<OutRoomResponseDataDto>("OUT_ROOM", request);
}