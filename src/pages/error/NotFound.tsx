import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-slate-600">Trang không tồn tại.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-appchat-bluesky px-5 py-3 font-semibold text-white"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}
