import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { clearAuthError, register } from "../../state/authSlice";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = status === "connecting";

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    dispatch(clearAuthError());

    if (!/^[A-Za-z0-9_]+$/.test(username)) {
      setFormError("Tên người dùng chỉ gồm chữ cái, số và dấu gạch dưới.");
      return;
    }

    if (password.length < 6) {
      setFormError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Mật khẩu xác nhận không khớp.");
      return;
    }

    void dispatch(register({ username, password }))
      .unwrap()
      .then(() => navigate("/login"))
      .catch(() => undefined);
  }

  const displayError =
    formError ??
    (error === "User already exists!"
      ? "Tên người dùng này đã đăng ký."
      : error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản</h1>
          <p className="mt-1 text-sm text-slate-500">
            Đăng ký để bắt đầu sử dụng AppChat.
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
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border p-3"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Xác nhận mật khẩu
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border p-3"
            required
          />
        </label>

        {displayError && (
          <p role="alert" className="text-sm text-red-600">
            {displayError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-appchat-bluesky p-3 font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link className="font-semibold text-appchat-bluesky" to="/login">
            Đăng nhập
          </Link>
        </p>
      </form>
    </main>
  );
}
