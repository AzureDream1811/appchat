export type ChatEvent =
  | "AUTH"
  | "REGISTER"
  | "LOGIN"
  | "LOGOUT"
  | "RE_LOGIN"
  | "GET_USER_LIST"
  | "CREATE_ROOM"
  | "JOIN_ROOM"
  | "OUT_ROOM"
  | "GET_ROOM_CHAT_MES"
  | "GET_PEOPLE_CHAT_MES"
  | "SEND_CHAT"
  | "CHECK_USER_ONLINE"
  | "CHECK_USER_EXIST";

export interface WsRequest<T = undefined> {
  action: "onchat";
  data: { event: ChatEvent; data?: T };
}

export interface WsSuccess<T> {
  status: "success";
  event: ChatEvent;
  data: T;
}

export interface WsError {
  status: "error";
  event: ChatEvent;
  mes: string;
}

export type WsResponse<T = unknown> = WsSuccess<T> | WsError;

export interface ReLoginPayload {
  user: string;
  code: string;
}

export interface RoomNamePayload {
  name: string;
}

export interface HistoryPayload {
  name: string;
  page: number;
}

export interface SendChatPayload {
  type: "room" | "people";
  to: string;
  mes: string;
}

export interface UserPayload {
  user: string;
}

export interface StatusResult {
  status: boolean;
}
