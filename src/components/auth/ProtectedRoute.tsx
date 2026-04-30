import React, { useEffect, useState } from "react";
import { useAuth } from "@/core/auth/useAuth";
import { LoginPage } from "./LoginPage";
import { apiClient } from "@/core/api-client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, enabled, token } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (enabled && token) {
      apiClient.setToken(token);
    }
    setIsReady(true);
  }, [enabled, token]);

  if (!isReady) {
    return null; // Or a generic loading spinner
  }

  if (enabled && !isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
