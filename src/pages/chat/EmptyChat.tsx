import { MessageSquareText } from "lucide-react";

export default function EmptyChat() {
  return (
    <div className="flex-1 h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-20 h-20 rounded-3xl bg-blue-100/60 text-blue-600 flex items-center justify-center mb-5 shadow-inner">
        <MessageSquareText className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Chào mừng bạn đến với AppChat!
      </h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
        Khám phá những tiện ích hỗ trợ trò chuyện cùng bạn bè và nhóm một cách dễ dàng.
      </p>
      <div className="mt-6 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs">
        Hãy chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu
      </div>
    </div>
  );
}