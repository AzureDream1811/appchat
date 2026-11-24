export interface WebSocketRequest<T> {
  action: "onchat";
  data: {
    event: string;
    data?: T;
  };
}

export interface WebSocketSuccessResponse<T> {
  status: "success";
  event: string;
  data: T;
}

export interface WebSocketErrorResponse {
  status: "error";
  event: string;
  mes: string;
}

export type WebSocketResponse<T> =
  | WebSocketSuccessResponse<T>
  | WebSocketErrorResponse;
