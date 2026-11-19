import type { GetUserListResponseDataDto } from "../api/events/userApi";
import { sendSocketMessage } from "../api/websocketClient";

export async function getUserList(): Promise<GetUserListResponseDataDto> {
  return await sendSocketMessage<GetUserListResponseDataDto>("GET_USER_LIST");
}