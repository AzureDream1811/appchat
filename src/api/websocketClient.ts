import type { WebSocketRequest } from "./websocketTypes";

const SOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL ?? "wss://chat.longapp.io.vn/chat/chat";
const REQUEST_TIMEOUT = 10_000;

let socket: WebSocket | null = null;

export function connectSocket(): Promise<void> {
  if (socket?.readyState === WebSocket.OPEN) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    socket = new WebSocket(SOCKET_URL);

    socket.onopen = () => resolve();
    socket.onerror = () => reject(new Error("Cannot connect to chat server."));
    socket.onclose = () => {
      socket = null;
    };
  });
}

export function disconnectSocket(): void {
  socket?.close();
  socket = null;
}

export async function sendSocketMessage<T>(
  event: string,
  data?: unknown,
): Promise<T> {
  await connectSocket();

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket is not connected.");
  }

  const connectedSocket = socket;

  const request: WebSocketRequest<unknown> = {
    action: "onchat",
    data: {
      event,
      data,
    },
  };

  socket.send(JSON.stringify(request));

  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      socket?.removeEventListener("message", handleMessage);
      reject(new Error(`${event} request timed out.`));
    }, REQUEST_TIMEOUT);

    function handleMessage(message: MessageEvent) {
      let response: unknown;

      try {
        response = JSON.parse(String(message.data));
      } catch {
        return;
      }

      if (
        typeof response !== "object" ||
        response === null ||
        !("event" in response) ||
        response.event !== event
      ) {
        return;
      }

      window.clearTimeout(timeoutId);
      socket?.removeEventListener("message", handleMessage);

      if ("status" in response && response.status === "error") {
        const message =
          "mes" in response && typeof response.mes === "string"
            ? response.mes
            : "Request failed.";
        reject(new Error(message));
        return;
      }

      if ("data" in response) {
        resolve(response.data as T);
      }
    }

    connectedSocket.addEventListener("message", handleMessage);
  });
}
