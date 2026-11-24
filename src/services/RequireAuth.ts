import { createElement, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useAppSelector";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const session = useAppSelector((state) => state.auth.session);

  if (!session) {
    return createElement(Navigate, { to: "/login", replace: true });
  }

  return children;
}