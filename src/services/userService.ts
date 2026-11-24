import type { UserList } from "../types/chat";
import type { StatusResult, UserPayload } from "../types/ws";
import { socket } from "./socket";

export async function checkUserExist(username: string): Promise<boolean> {
  const requestData: UserPayload = { user: username };
  const response = await socket.request<StatusResult>("CHECK_USER_EXIST", requestData);
  return response.status;
}

export async function getUserList(): Promise<UserList> {
  return await socket.request<UserList>("GET_USER_LIST");
}