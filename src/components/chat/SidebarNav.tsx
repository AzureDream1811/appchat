import { useNavigate } from "react-router-dom";
import { MessageSquare, Users, CheckSquare, Settings, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logout } from "../../state/authSlice";

interface SidebarNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}


export default function SidebarNav({ activeTab = "messages", onTabChange }: SidebarNavProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const session = useAppSelector((state) => state.auth.session);
  const username = session?.username ?? "User";

  const firstLetter = username.charAt(0).toUpperCase();

  function handleLogout() {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      void dispatch(logout())
        .unwrap()
        .then(() => navigate("/login"))
        .catch(() => undefined);
    }
  }

  return (
    <aside className="w-16 h-full bg-[#0068ff] flex flex-col items-center justify-between py-4 text-white shrink-0 select-none">
      
      <div className="flex flex-col items-center gap-6">
        <div 
          className="relative group cursor-pointer"
          title={`Tài khoản: ${username}`}
        >
          <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-lg hover:scale-105 transition-transform shadow-md">
            {firstLetter}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0068ff] rounded-full"></span>
        </div>

        <nav className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onTabChange?.("messages")}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              activeTab === "messages"
                ? "bg-white/25 shadow-inner font-bold"
                : "hover:bg-white/10 text-white/80 hover:text-white"
            }`}
            title="Tin nhắn"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => onTabChange?.("contacts")}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              activeTab === "contacts"
                ? "bg-white/25 shadow-inner font-bold"
                : "hover:bg-white/10 text-white/80 hover:text-white"
            }`}
            title="Danh bạ"
          >
            <Users className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => onTabChange?.("todos")}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              activeTab === "todos"
                ? "bg-white/25 shadow-inner font-bold"
                : "hover:bg-white/10 text-white/80 hover:text-white"
            }`}
            title="Công việc"
          >
            <CheckSquare className="w-6 h-6" />
          </button>
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          title="Cài đặt"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white/80 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
          title="Đăng xuất"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

    </aside>
  );
}