let generatedMessageSequence = 0;

const timeOptions: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

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

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString([], timeOptions);
}
