import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cc-bg)]">
        <p className="text-sm text-[var(--cc-text-muted)]">Checking administrator access…</p>
      </div>
    );
  }

  return role === "admin" ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
