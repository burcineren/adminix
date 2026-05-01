import { useEffect } from "react";
import { useAuth } from "@/core/auth/useAuth";
import { LoginPage } from "./LoginPage";
import { apiClient } from "@/core/api-client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, enabled, token } = useAuth();

  useEffect(() => {
    if (enabled && token) {
      apiClient.setToken(token);
    }
  }, [enabled, token]);

  if (enabled && !isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
