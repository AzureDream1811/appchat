import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { clearAuthError, login } from "../state/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isSubmitting = status === "connecting";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(clearAuthError());

    void dispatch(login({ username, password }))
      .unwrap()
      .then(() => navigate("/chat"))
      .catch(() => undefined);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="mt-1 text-sm text-slate-500">
            Đăng nhập vào tài khoản AppChat của bạn.
          </p>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Tên người dùng
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSubmitting}
            autoComplete="username"
            className="mt-1 w-full rounded-md border p-3"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border p-3"
            required
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-appchat-bluesky p-3 font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link className="font-semibold text-appchat-bluesky" to="/register">
            Đăng ký
          </Link>
        </p>
      </form>
    </main>
  );
}