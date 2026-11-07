import { useAppSelector } from "../hooks/redux";

export default function ChatPage() {
  const session = useAppSelector((state) => state.auth.session);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="rounded-xl bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold text-slate-900">AppChat</h1>
        <p className="mt-2 text-slate-600">
          Đã đăng nhập với tài khoản {session?.username ?? "người dùng"}.
        </p>
      </section>
    </main>
  );
}
