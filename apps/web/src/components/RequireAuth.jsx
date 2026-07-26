import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3"></div>
        <p className="font-mono-code text-mono-code text-on-surface-variant text-[13px]">
          Authenticating session...
        </p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
