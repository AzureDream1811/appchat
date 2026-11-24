import type { CheckUserExistResponseDto, GetUserListResponseDataDto } from "../types/chat";
import { socket } from "./socket";

export async function checkUserExist(username: string): Promise<boolean> {
  const requestData = { user: username };
  const response = await socket.request<CheckUserExistResponseDto>("CHECK_USER_EXIST", requestData);
  return response.status;
}

export async function getUserList(): Promise<GetUserListResponseDataDto> {
  return await socket.request<GetUserListResponseDataDto>("GET_USER_LIST");
}