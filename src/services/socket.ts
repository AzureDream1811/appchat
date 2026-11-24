import type {
  ChatEvent,
  WsRequest,
  WsResponse,
} from "../types/ws";

const SOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL ?? "wss://chat.longapp.io.vn/chat/chat";
const REQUEST_TIMEOUT = 10_000;

type SocketListener = (response: WsResponse<unknown>) => void;

interface PendingRequest {
  event: ChatEvent;
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timeoutId: number;
}

class SocketService {
  private ws: WebSocket | null = null;
  private listeners = new Set<SocketListener>();
  private connecting: Promise<void> | null = null;
  private pendingRequests = new Set<PendingRequest>();

  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }
    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(SOCKET_URL);
      this.ws = ws;

      ws.onopen = () => {
        this.connecting = null;
        resolve();
      };

      ws.onerror = () => {
        this.connecting = null;
        reject(new Error("WebSocket connection error."));
      };

      ws.onmessage = (event) => {
        let response: WsResponse<unknown>;

        try {
          response = JSON.parse(String(event.data)) as WsResponse<unknown>;
        } catch {
          console.error("Invalid WebSocket JSON response.");
          return;
        }

        for (const listener of this.listeners) {
          listener(response);
        }

        const request = [...this.pendingRequests].find(
          (pending) => pending.event === response.event,
        );

        if (request) {
          window.clearTimeout(request.timeoutId);
          this.pendingRequests.delete(request);

          if (response.status === "error") {
            request.reject(new Error(response.mes || "Request failed."));
          } else {
            request.resolve(response.data);
          }
        }
      };

      ws.onclose = () => {
        if (this.ws !== ws) return;

        this.ws = null;
        this.connecting = null;

        for (const request of this.pendingRequests) {
          window.clearTimeout(request.timeoutId);
          request.reject(new Error("WebSocket connection closed."));
        }
        this.pendingRequests.clear();
      };
    });

    return this.connecting;
  }

  async send<T>(event: ChatEvent, data?: T): Promise<boolean> {
    await this.connect();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const message: WsRequest<T> = {
      action: "onchat",
      data: { event, data },
    };

    this.ws.send(JSON.stringify(message));
    return true;
  }

  async request<T>(event: ChatEvent, data?: unknown): Promise<T> {
    await this.connect();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected.");
    }

    const message: WsRequest<unknown> = {
      action: "onchat",
      data: { event, data },
    };

    return new Promise<T>((resolve, reject) => {
      const pendingRequest: PendingRequest = {
        event,
        resolve: (value) => resolve(value as T),
        reject,
        timeoutId: 0,
      };

      pendingRequest.timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(pendingRequest);
        reject(new Error("Request timed out."));
      }, REQUEST_TIMEOUT);

      this.pendingRequests.add(pendingRequest);
      this.ws?.send(JSON.stringify(message));
    });
  }

  subscribe(listener: SocketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.connecting = null;
  }
}

export const socket = new SocketService();
