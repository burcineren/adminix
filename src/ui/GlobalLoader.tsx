import React, { useEffect, useState } from "react";
import { useAdminStore } from "@/core/store";
import { cn } from "@/utils/cn";

export function GlobalLoader() {
  const globalLoading = useAdminStore((state) => state.globalLoading);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  
  // Track previous loading state to sync during render
  const [prevLoading, setPrevLoading] = useState(globalLoading);

  // SYNC STATE DURING RENDER
  // This avoids the "Cascading Render" warning by updating state before the browser paints.
  if (globalLoading !== prevLoading) {
    setPrevLoading(globalLoading);
    if (globalLoading) {
      setIsExiting(false);
      setProgress(10);
    } else if (progress > 0) {
      setIsExiting(true);
      setProgress(100);
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (globalLoading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + (90 - prev) * 0.1;
        });
      }, 500);
    } else if (isExiting) {
      const timeout = setTimeout(() => {
        setIsExiting(false);
        setProgress(0);
      }, 400);
      
      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [globalLoading, isExiting]);

  const isVisible = globalLoading || isExiting;
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      {/* Progress Bar */}
      <div 
        className={cn(
          "h-[3px] bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-foreground))] transition-all duration-300 ease-out",
          isExiting ? "opacity-0" : "opacity-100"
        )}
        style={{ 
          width: `${progress}%`, 
          boxShadow: progress > 0 && progress < 100 ? '0 0 10px hsl(var(--primary) / 0.5)' : 'none' 
        }}
      />
      
      {/* Subtle Spinner in corner */}
      {globalLoading && (
        <div className="absolute top-4 right-4 animate-spin h-4 w-4 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full" />
      )}
    </div>
  );
}


