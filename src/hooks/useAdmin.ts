import { useAdminStore } from "@/core/store";
import { useCallback } from "react";

export function useAdmin() {
  const {
    activeResource,
    setActiveResource,
    globalLoading,
    setGlobalLoading,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    resources,
    plugins,
  } = useAdminStore();

  /**
   * Run an async task with global loading indicator
   */
  const withLoading = useCallback(async <T>(task: () => Promise<T>): Promise<T> => {
    setGlobalLoading(true);
    try {
      return await task();
    } finally {
      setGlobalLoading(false);
    }
  }, [setGlobalLoading]);

  return {
    activeResource,
    setActiveResource,
    globalLoading,
    setGlobalLoading,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    resources,
    plugins,
    withLoading,
  };
}
