import { useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import type { Conversation } from "../../types/chat";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenCreateGroup?: () => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelectConversation,
  onOpenCreateGroup,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");

  const filteredConversations = conversations.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = filterTab === "all" || (filterTab === "unread" && (item.unreadCount ?? 0) > 0);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="w-80 md:w-88 h-full bg-white border-r border-slate-200 flex flex-col shrink-0">
      
      <div className="p-3 border-b border-slate-100 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bạn bè, nhóm..."
            className="w-full bg-slate-100 text-slate-800 placeholder-slate-400 text-base pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
          />
        </div>

        <button
          type="button"
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Thêm bạn"
        >
          <UserPlus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onOpenCreateGroup}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Tạo nhóm chat"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>

      <div className="flex px-4 pt-2 border-b border-slate-100 text-xs font-semibold text-slate-500 gap-4">
        <button
          type="button"
          onClick={() => setFilterTab("all")}
          className={`pb-2 transition-all relative ${
            filterTab === "all"
              ? "text-blue-600 font-bold"
              : "hover:text-slate-800"
          }`}
        >
          Tất cả
          {filterTab === "all" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("unread")}
          className={`pb-2 transition-all relative ${
            filterTab === "unread"
              ? "text-blue-600 font-bold"
              : "hover:text-slate-800"
          }`}
        >
          Chưa đọc
          {filterTab === "unread" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Không tìm thấy cuộc trò chuyện nào
          </div>
        ) : (
          filteredConversations.map((item) => {
            const isSelected = item.id === selectedId;

            return (
              <div
                key={item.id}
                onClick={() => onSelectConversation(item.id)}
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors select-none ${
                  isSelected
                    ? "bg-blue-50/80 border-l-4 border-blue-600"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover bg-slate-200 border border-slate-100 shadow-xs"
                  />
                  {item.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4
                      className={`text-base truncate ${
                        isSelected ? "font-bold text-blue-900" : "font-semibold text-slate-800"
                      }`}
                    >
                      {item.name}
                    </h4>
                    <span className="text-[12px] text-slate-500 shrink-0 ml-2">
                      {item.lastMessageTime}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <p className="text-[14px] text-slate-500 truncate flex-1">
                      {item.lastMessage}
                    </p>
                    {(item.unreadCount ?? 0) > 0 && (
                      <span className="shrink-0 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4 text-center">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}