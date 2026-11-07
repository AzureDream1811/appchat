import type {
  WebSocketRequest,
  WebSocketResponse,
} from "./websocketTypes";

const WEBSOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL ?? "wss://chat.longapp.io.vn/chat/chat";
const REQUEST_TIMEOUT_MS = 10_000;

type PendingRequest = {
  resolve: (data: unknown) => void;
  reject: (error: Error) => void;
  timeoutId: number;
};

class WebSocketClient {
  private socket: WebSocket | null = null;
  private connection: Promise<void> | null = null;
  private pending = new Map<string, PendingRequest[]>();

  connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.connection) {
      return this.connection;
    }

    this.connection = new Promise((resolve, reject) => {
      const socket = new WebSocket(WEBSOCKET_URL);
      this.socket = socket;

      socket.onopen = () => {
        this.connection = null;
        resolve();
      };

      socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      socket.onerror = () => {
        const error = new Error("Unable to connect to the chat server.");
        this.rejectPending(error);
        this.connection = null;
        reject(error);
      };

      socket.onclose = () => {
        this.socket = null;
        this.connection = null;
        this.rejectPending(new Error("The chat connection was closed."));
      };
    });

    return this.connection;
  }

  disconnect(): void {
    this.rejectPending(new Error("The chat connection was closed."));
    this.socket?.close();
    this.socket = null;
    this.connection = null;
  }

  async send<TRequest, TResponse>(
    event: string,
    data: TRequest,
  ): Promise<TResponse> {
    await this.connect();

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("The chat connection is not open.");
    }

    return new Promise<TResponse>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.removePending(event, request);
        reject(new Error(`${event} request timed out.`));
      }, REQUEST_TIMEOUT_MS);

      const request: PendingRequest = {
        resolve: (responseData) => resolve(responseData as TResponse),
        reject,
        timeoutId,
      };

      const requests = this.pending.get(event) ?? [];
      requests.push(request);
      this.pending.set(event, requests);

      const payload: WebSocketRequest<TRequest> = {
        action: "onchat",
        data: { event, data },
      };

      try {
        this.socket?.send(JSON.stringify(payload));
      } catch (error) {
        this.removePending(event, request);
        reject(
          error instanceof Error
            ? error
            : new Error("Unable to send the WebSocket request."),
        );
      }
    });
  }

  private handleMessage(rawData: unknown): void {
    let response: unknown;

    try {
      response = JSON.parse(String(rawData));
    } catch {
      this.rejectPending(new Error("The server returned invalid JSON."));
      return;
    }

    if (!this.isResponse(response)) {
      return;
    }

    const requests = this.pending.get(response.event);
    const request = requests?.shift();

    if (!request) {
      return;
    }

    if (requests?.length === 0) {
      this.pending.delete(response.event);
    }

    window.clearTimeout(request.timeoutId);

    if (response.status === "error") {
      request.reject(new Error(response.mes));
    } else {
      request.resolve(response.data);
    }
  }

  private isResponse(value: unknown): value is WebSocketResponse<unknown> {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const response = value as Record<string, unknown>;

    return (
      (response.status === "success" || response.status === "error") &&
      typeof response.event === "string"
    );
  }

  private removePending(event: string, request: PendingRequest): void {
    const requests = this.pending.get(event);

    if (!requests) {
      return;
    }

    const index = requests.indexOf(request);
    if (index >= 0) {
      requests.splice(index, 1);
    }

    if (requests.length === 0) {
      this.pending.delete(event);
    }
  }

  private rejectPending(error: Error): void {
    for (const requests of this.pending.values()) {
      for (const request of requests) {
        window.clearTimeout(request.timeoutId);
        request.reject(error);
      }
    }

    this.pending.clear();
  }
}

export const websocketClient = new WebSocketClient();