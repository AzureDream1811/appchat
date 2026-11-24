import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/useAppSelector";

export default function RequireAuth() {
  const { session, status } = useAppSelector((state) => state.auth);

  if (status === "bootstrapping") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Đang khôi phục phiên đăng nhập...</p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}