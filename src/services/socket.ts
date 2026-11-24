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
  private authenticated = false;
  private reloginPromise: Promise<void> | null = null;

  isAuthenticated(): boolean {
    return this.authenticated && this.ws?.readyState === WebSocket.OPEN;
  }

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

        if (response.event === "AUTH" && response.status === "error") {
          this.authenticated = false;
          const error = new Error(response.mes || "Authentication failed.");
          for (const pending of this.pendingRequests) {
            window.clearTimeout(pending.timeoutId);
            pending.reject(error);
          }
          this.pendingRequests.clear();
          return;
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
            if (response.event === "LOGIN" || response.event === "RE_LOGIN") {
              this.authenticated = true;
            } else if (response.event === "LOGOUT") {
              this.authenticated = false;
            }
            request.resolve(response.data);
          }
        }
      };

      ws.onclose = () => {
        if (this.ws !== ws) return;

        this.ws = null;
        this.connecting = null;
        this.authenticated = false;

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
    await this.ensureAuthenticated(event);
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
    await this.ensureAuthenticated(event);
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
    this.authenticated = false;
  }

  private async ensureAuthenticated(event: ChatEvent): Promise<void> {
    if (
      event === "REGISTER" ||
      event === "LOGIN" ||
      event === "RE_LOGIN" ||
      event === "LOGOUT" ||
      this.isAuthenticated()
    ) {
      return;
    }

    if (this.reloginPromise) {
      return this.reloginPromise;
    }

    const user = localStorage.getItem("user");
    const code = localStorage.getItem("reLoginCode");
    if (!user || !code) {
      throw new Error("You must log in before continuing.");
    }

    this.reloginPromise = this.request("RE_LOGIN", { user, code })
      .then(() => undefined)
      .finally(() => {
        this.reloginPromise = null;
      });

    return this.reloginPromise;
  }
}

export const socket = new SocketService();
