import type {
  LoginResponseDataDto,
  RegisterRequestDto,
  RegisterResponseDataDto,
  LoginRequestDto,
} from "../api/events/authApi";
import type { WebSocketRequest } from "../api/websocketTypes";

const WEBSOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL ?? "wss://chat.longapp.io.vn/chat/chat";
const REQUEST_TIMEOUT_MS = 10_000;

interface ServerResponse {
  status: "success" | "error";
  event: string;
  data?: unknown;
  mes?: string;
}

function isServerResponse(value: unknown): value is ServerResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    (response.status === "success" || response.status === "error") &&
    typeof response.event === "string"
  );
}

function sendAuthRequest(event: string, data: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(WEBSOCKET_URL);
    const timeoutId = window.setTimeout(() => {
      socket.close();
      reject(new Error("Request timed out."));
    }, REQUEST_TIMEOUT_MS);

    const finish = (callback: () => void) => {
      window.clearTimeout(timeoutId);
      socket.close();
      callback();
    };

    socket.onopen = () => {
      const request: WebSocketRequest<unknown> = {
        action: "onchat",
        data: { event, data },
      };

      socket.send(JSON.stringify(request));
    };

    socket.onmessage = (message) => {
      let response: unknown;

      try {
        response = JSON.parse(String(message.data));
      } catch {
        finish(() => reject(new Error("The server returned invalid JSON.")));
        return;
      }

      if (!isServerResponse(response) || response.event !== event) {
        return;
      }

      if (response.status === "error") {
        finish(() => reject(new Error(response.mes ?? "Request failed.")));
        return;
      }

      finish(() => resolve(response.data));
    };

    socket.onerror = () => {
      finish(() => reject(new Error("Unable to connect to the chat server.")));
    };

    socket.onclose = () => {
      window.clearTimeout(timeoutId);
    };
  });
}

export async function register(
  username: string,
  password: string,
): Promise<RegisterResponseDataDto> {
  const request: RegisterRequestDto = {
    user: username,
    pass: password,
  };
  const response = await sendAuthRequest("REGISTER", request);

  if (typeof response !== "string") {
    throw new Error("Invalid REGISTER response.");
  }

  return response;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponseDataDto> {
  const request: LoginRequestDto = {
    user: username,
    pass: password,
  };
  const response = await sendAuthRequest("LOGIN", request);

  if (
    typeof response !== "object" ||
    response === null ||
    typeof (response as Record<string, unknown>).RE_LOGIN_CODE !== "string"
  ) {
    throw new Error("Invalid LOGIN response.");
  }

  return response as LoginResponseDataDto;
}
