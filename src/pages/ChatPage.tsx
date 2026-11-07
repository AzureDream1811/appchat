import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../state/authSlice";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const session = useAppSelector((state) => state.auth.session);
  const status = useAppSelector((state) => state.auth.status);

  function handleLogout() {
    void dispatch(logout())
      .unwrap()
      .then(() => navigate("/login"))
      .catch(() => undefined);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold text-slate-900">AppChat</h1>
        <p className="mt-2 text-slate-600">
          Đã đăng nhập với tài khoản {session?.username ?? "người dùng"}.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          disabled={status === "connecting"}
          className="mt-5 rounded-md bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {status === "connecting" ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </section>
    </main>
  );
}
