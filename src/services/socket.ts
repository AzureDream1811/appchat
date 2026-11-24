import type { ChatEvent, WsRequest, WsResponse } from "../types/ws";

const SOCKET_URL = "wss://chat.longapp.io.vn/chat/chat";
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

  // Connect to the WebSocket server
  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return Promise.resolve();
    if (this.connecting) return this.connecting;

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
      ws.onmessage = (e) => this.handleMessage(e);
      ws.onclose = () => this.handleClose(ws);
    });

    return this.connecting;
  }

  // Handle incoming WebSocket messages by parsing the JSON and notifying listeners
  // resolve/reject pending requests based on the event type and status
  private handleMessage(event: MessageEvent): void {
    let res: WsResponse<unknown>;

    try {
      res = JSON.parse(String(event.data)) as WsResponse<unknown>;
    } catch {
      console.error("Invalid WebSocket JSON response.");
      return;
    }

    this.listeners.forEach((listener) => listener(res));

    const pending = [...this.pendingRequests].find(
      (p) => p.event === res.event,
    );
    if (!pending) return;

    window.clearTimeout(pending.timeoutId);
    this.pendingRequests.delete(pending);

    if (res.status === "error") {
      pending.reject(new Error(res.mes || "Request failed."));
    } else {
      pending.resolve(res.data);
    }
  }

  // Handle WebSocket close event
  private handleClose(ws: WebSocket): void {
    if (this.ws !== ws) return;
    this.ws = null;
    this.connecting = null;
    this.rejectAllPending(new Error("WebSocket connection closed."));
  }

  // Reject all pending requests with the provided error
  private rejectAllPending(error: Error): void {
    for (const p of this.pendingRequests) {
      window.clearTimeout(p.timeoutId);
      p.reject(error);
    }
    this.pendingRequests.clear();
  }

  // Send a message to the WebSocket server
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

  // Request a response from the WebSocket server
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

      try{
        this.ws?.send(JSON.stringify(message));
      } catch (error) {
        console.error("Failed to send WebSocket request:", error);
        this.pendingRequests.delete(pendingRequest);
        window.clearTimeout(pendingRequest.timeoutId);
        reject(new Error("Failed to send WebSocket request."));
      }
    });
  }

  // Subscribe to WebSocket messages
  subscribe(listener: SocketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Disconnect from the WebSocket server
  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.connecting = null;
    this.rejectAllPending(new Error("WebSocket disconnected."));
  }
}

export const socket = new SocketService();
