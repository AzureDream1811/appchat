import type { WebSocketRequest } from "./websocketTypes";

const SOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL ?? "wss://chat.longapp.io.vn/chat/chat";
const REQUEST_TIMEOUT = 10_000;

let socket: WebSocket | null = null;

type SocketEventListener = (response: any) => void;
const globalListeners = new Set<SocketEventListener>();

export function subscribeSocketEvent(callback: SocketEventListener): () => void {
  globalListeners.add(callback);
  return () => {
    globalListeners.delete(callback);
  };
}

export function connectSocket(): Promise<void> {

  // Check if the socket is already connected
  if (socket?.readyState === WebSocket.OPEN) {
    return Promise.resolve();
  }

  // If the socket is not connected, create a new WebSocket connection
  return new Promise((resolve, reject) => {
    socket = new WebSocket(SOCKET_URL);

    socket.onopen = () => resolve();
    socket.onmessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(String(event.data));
        globalListeners.forEach((listener) => {
          try {
            listener(payload);
          } catch (err) {
            console.error("Listener error:", err);
          }
        });
      } catch (err) {
        console.error("Parse WS message error:", err);
      }
    };
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
  // 1. Connect to WebSocket
  await connectSocket();

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket is not connected.");
  }

  const request: WebSocketRequest<unknown> = {
    action: "onchat",
    data: { event, data },
  };

  const connectedSocket = socket;

  // 2. Send request and wait for response
  return new Promise<T>((resolve, reject) => {
    // Timeout after 10 seconds
    const timeoutId = window.setTimeout(() => {
      connectedSocket.removeEventListener("message", handleMessage);
      reject(new Error("Request timed out."));
    }, REQUEST_TIMEOUT);

    // 3. Listen for server response
    function handleMessage(message: MessageEvent) {
      const response = JSON.parse(String(message.data));
      console.log("[WebSocket Nhận về]:", response);

      if (response.event === "AUTH" && response.status === "error") {
        window.clearTimeout(timeoutId);
        connectedSocket.removeEventListener("message", handleMessage);
        reject(new Error(response.mes || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"));
        return;
      }
      // Only handle the matching event
      if (response.event !== event) return;

      window.clearTimeout(timeoutId);
      connectedSocket.removeEventListener("message", handleMessage);

      // Handle error response
      if (response.status === "error") {
        reject(new Error(response.mes || "Request failed."));
        return;
      }

      // Return response data
      resolve(response.data as T);
    }

    connectedSocket.addEventListener("message", handleMessage);

    // 4. Send JSON request
    console.log("[WebSocket Gửi đi]:", request);
    connectedSocket.send(JSON.stringify(request));
  });
}
export async function sendSocketEvent(event: string, data?: unknown): Promise<void> {
  await connectSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket chưa được kết nối!");
  }
  const request = {
    action: "onchat",
    data: { event, data },
  };
  console.log("[WebSocket Bắn tin nhanh]:", request);
  socket.send(JSON.stringify(request));
}

