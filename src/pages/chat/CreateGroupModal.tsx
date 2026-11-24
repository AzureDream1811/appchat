import { useState, useEffect } from "react";
import { X, Users, LogIn, Sparkles } from "lucide-react";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string) => void;
  onJoinGroup: (groupName: string) => void;
  loading?: boolean;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
  onJoinGroup,
  loading = false,
}: CreateGroupModalProps) {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setGroupName("");
      setError("");
      setTab("create");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      setError("Vui lòng nhập tên nhóm chat!");
      return;
    }
    setError("");

    if (tab === "create") {
      onCreateGroup(trimmedName);
    } else {
      onJoinGroup(trimmedName);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0068ff] flex items-center justify-center">
              {tab === "create" ? <Users className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {tab === "create" ? "Tạo nhóm chat mới" : "Tham gia nhóm chat"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6 pt-3 gap-6 text-sm font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => {
              setTab("create");
              setError("");
            }}
            className={`pb-2.5 transition-all relative ${
              tab === "create" ? "text-[#0068ff] font-bold" : "hover:text-slate-800"
            }`}
          >
            Tạo nhóm mới
            {tab === "create" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0068ff] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("join");
              setError("");
            }}
            className={`pb-2.5 transition-all relative ${
              tab === "join" ? "text-[#0068ff] font-bold" : "hover:text-slate-800"
            }`}
          >
            Tham gia nhóm đã có
            {tab === "join" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0068ff] rounded-full" />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Tên nhóm <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  if (error) setError("");
                }}
                placeholder={
                  tab === "create"
                    ? "Nhập tên nhóm muốn tạo (ví dụ: Team Dự Án...)"
                    : "Nhập chính xác tên nhóm muốn tham gia..."
                }
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0068ff]/20 focus:border-[#0068ff] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
            {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/50 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#0068ff] shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              {tab === "create"
                ? "Sau khi tạo nhóm, bạn sẽ là chủ phòng và có thể mời bạn bè tham gia trò chuyện."
                : "Nhập tên phòng đã tồn tại trên hệ thống để tham gia và nhận tin nhắn cùng mọi người."}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#0068ff] hover:bg-[#0055d4] shadow-sm shadow-[#0068ff]/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading
                ? tab === "create"
                  ? "Đang tạo..."
                  : "Đang tham gia..."
                : tab === "create"
                ? "Tạo nhóm"
                : "Tham gia nhóm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}