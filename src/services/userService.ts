import type { CheckUserExistResponseDto, GetUserListResponseDataDto } from "../api/events/userApi";
import { sendSocketMessage } from "../api/websocketClient";

export async function checkUserExist(username: string): Promise<boolean> {
  const requestData = { user: username };
  const response = await sendSocketMessage<CheckUserExistResponseDto>("CHECK_USER_EXIST", requestData);
  return response.status;
}

export async function getUserList(): Promise<GetUserListResponseDataDto> {
  return await sendSocketMessage<GetUserListResponseDataDto>("GET_USER_LIST");
}