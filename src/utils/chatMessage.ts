import type { Conversation } from "../types/chat";

let generatedMessageSequence = 0;

const timeOptions: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
};

function parseChatDate(value: string): Date | null {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && value.trim() !== "") {
    const timestamp = Math.abs(numericValue) < 1_000_000_000_000
      ? numericValue * 1_000
      : numericValue;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const normalizedValue = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(value)
    ? `${value.replace(" ", "T")}${hasTimezone ? "" : "+07:00"}`
    : value;
  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function createMessageId(serverId?: number): string {
  if (serverId !== undefined && Number.isSafeInteger(serverId) && serverId > 0) {
    return `msg-${serverId}`;
  }

  return `msg-local-${Date.now()}-${generatedMessageSequence++}`;
}

export function formatChatTime(value?: string): string {
  if (!value) {
    return new Date().toLocaleTimeString([], timeOptions);
  }

  const date = parseChatDate(value);
  return date ? date.toLocaleTimeString([], timeOptions) : value;
}

export function createDirectConversation(username: string): Conversation {
  return {
    id: `user-${username}`,
    name: username,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
    type: "direct",
    lastMessage: "",
    lastMessageTime: "",
    unreadCount: 0,
    isOnline: false,
  };
}
