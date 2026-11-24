import { useState, useRef, useLayoutEffect } from "react";
import { Phone, Video, Info, Smile, Image, Paperclip, Send, X } from "lucide-react";
import type { Conversation, Message } from "../../types/chat";
import type { RoomMember } from "../../types/chat";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onToggleInfo?: () => void;
  isInfoOpen?: boolean;
  roomMembers?: RoomMember[];
  onCloseInfo?: () => void;
  onLeaveRoom?: () => void;
  isLeavingRoom?: boolean;
  canLeaveRoom?: boolean;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export default function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onToggleInfo,
  isInfoOpen = false,
  roomMembers = [],
  onCloseInfo,
  onLeaveRoom,
  isLeavingRoom = false,
  canLeaveRoom = true,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollBeforeLoadRef = useRef<{
    conversationId: string;
    height: number;
    top: number;
  } | null>(null);
  const loadingMoreRef = useRef(false);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const previousScroll = scrollBeforeLoadRef.current;
    if (previousScroll?.conversationId === conversation.id) {
      container.scrollTop =
        previousScroll.top + container.scrollHeight - previousScroll.height;
      scrollBeforeLoadRef.current = null;
      return;
    }

    scrollBeforeLoadRef.current = null;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [conversation.id, messages]);

  async function handleLoadMore() {
    const container = messagesContainerRef.current;
    if (
      !container ||
      !onLoadMore ||
      !hasMore ||
      isLoadingMore ||
      loadingMoreRef.current
    ) {
      return;
    }

    loadingMoreRef.current = true;
    scrollBeforeLoadRef.current = {
      conversationId: conversation.id,
      height: container.scrollHeight,
      top: container.scrollTop,
    };

    try {
      await onLoadMore();
    } catch (error) {
      console.error("Không thể tải thêm tin nhắn cũ:", error);
      scrollBeforeLoadRef.current = null;
    } finally {
      loadingMoreRef.current = false;
      requestAnimationFrame(() => {
        const previousScroll = scrollBeforeLoadRef.current;
        const currentContainer = messagesContainerRef.current;
        if (
          previousScroll?.conversationId === conversation.id &&
          currentContainer
        ) {
          currentContainer.scrollTop =
            previousScroll.top +
            currentContainer.scrollHeight -
            previousScroll.height;
          scrollBeforeLoadRef.current = null;
        }
      });
    }
  }

  function handleMessagesScroll() {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop <= 40) {
      void handleLoadMore();
    }
  }

  function handleSend() {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }
  return (
    <div className="relative flex-1 h-full flex flex-col bg-[#eef0f3] overflow-hidden">

      <div className="h-16 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200"
            />
            {conversation.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">{conversation.name}</h3>
            <p className="text-[13px] text-slate-600">
              {conversation.type === "group" ? "Nhóm trò chuyện" : conversation.isOnline ? "Đang hoạt động" : "Truy cập gần đây"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Cuộc gọi thoại"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Cuộc gọi video"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onToggleInfo}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Thông tin hội thoại"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isInfoOpen && conversation.type === "group" && (
        <aside className="absolute right-0 top-0 bottom-0 z-30 w-80 border-l border-slate-200 bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
            <div>
              <h3 className="font-bold text-slate-800">Thông tin phòng</h3>
              <p className="text-xs text-slate-500">{roomMembers.length} thành viên</p>
            </div>
            <button
              type="button"
              onClick={onCloseInfo}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              title="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Thành viên hiện tại
            </p>
            {roomMembers.length === 0 ? (
              <p className="text-sm text-slate-400">Không có thành viên.</p>
            ) : (
              <div className="space-y-2">
                {roomMembers.map((member) => (
                  <div
                    key={`${member.id}-${member.name}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onLeaveRoom}
                disabled={!canLeaveRoom || isLeavingRoom}
                className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLeavingRoom
                  ? "Đang rời phòng..."
                  : canLeaveRoom
                    ? "Rời phòng"
                    : "Chủ phòng không thể rời"}
              </button>
            </div>
          </div>
        </aside>
      )}

      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {(hasMore || isLoadingMore) && (
          <div className="flex justify-center">
            {isLoadingMore ? (
              <span className="text-sm text-slate-500">
                Đang tải tin nhắn cũ...
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void handleLoadMore()}
                className="rounded-md px-3 py-1 text-sm font-medium text-blue-600 hover:bg-white"
              >
                Tải tin nhắn cũ hơn
              </button>
            )}
          </div>
        )}
        {messages.map((msg) => {
          if (msg.isMe) {
            return (
              <div key={msg.id} className="flex justify-end items-end gap-2">
                <span className="text-[11px] text-slate-400 mb-1">{msg.createdAt}</span>
                <div className="max-w-[70%] md:max-w-[60%] bg-[#0068ff] text-white px-4 py-2.5 rounded-2xl rounded-br-xs shadow-xs break-words text-base leading-relaxed">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-start gap-2.5">
              {msg.senderAvatar ? (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full object-cover bg-slate-200 shrink-0 mt-1"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-1">
                  {msg.senderName.charAt(0)}
                </div>
              )}
              <div className="max-w-[70%] md:max-w-[60%]">
                {conversation.type === "group" && (
                  <p className="text-[11px] text-slate-500 font-semibold mb-1 ml-1">
                    {msg.senderName}
                  </p>
                )}
                <div className="flex items-end gap-2">
                  <div className="bg-white text-slate-800 px-4 py-2.5 rounded-2xl rounded-bl-xs border border-slate-100 shadow-2xs break-words text-base leading-relaxed">
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-slate-400 mb-1">{msg.createdAt}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border-t border-slate-200 p-3 shrink-0">
        <div className="flex items-center gap-1 mb-2 px-1">
          <button
            type="button"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Biểu tượng cảm xúc & Sticker"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Gửi hình ảnh"
          >
            <Image className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Đính kèm tập tin"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Nhập tin nhắn tới ${conversation.name}... (Nhấn Enter để gửi)`}
            className="flex-1 bg-slate-100 text-slate-800 placeholder-slate-400 text-base px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-[#0068ff] hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-blue-500/20"
            title="Gửi tin nhắn"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}