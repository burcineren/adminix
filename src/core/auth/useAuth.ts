import { useCallback, useState } from "react";
import { useAuthStore } from "./auth-store";
import { useAdminStore } from "@/core/store";
import { apiClient } from "@/core/api-client";
import { toast } from "sonner";
import { AdminState } from "@/core/store";

export function useAuth() {
  const store = useAuthStore();
  const config = useAdminStore((s: AdminState) => s.authConfig);
  const enableAuth = useAdminStore((s: AdminState) => s.enableAuth);
  const [isLoading, setIsLoading] = useState(false);

  const getNestedValue = (obj: Record<string, unknown>, path: string) => {
    return path.split('.').reduce((acc, part) => (acc as Record<string, unknown>) && (acc as Record<string, unknown>)[part], obj);
  };

  const login = useCallback(async (credentials: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      if (config?.provider) {
        const { user, token } = await config.provider.login(credentials);
        store.login(user, token);
        apiClient.setToken(token);
        return { success: true };
      }

      const endpoint = config?.loginEndpoint || "/api/login";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      const token = getNestedValue(data, config?.tokenField || "token");
      const user = getNestedValue(data, config?.userField || "user");

      if (!token) throw new Error("Token not found in response");

      store.login(user || { id: 1, email: credentials.email, roles: [] }, token);
      apiClient.setToken(token);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [config, store]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (config?.provider) {
        await config.provider.logout();
      }
      store.logout();
      apiClient.setToken(null);
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setIsLoading(false);
    }
  }, [config, store]);

  return {
    ...store,
    login,
    logout,
    isLoading,
    enabled: enableAuth,
    config,
  };
}
