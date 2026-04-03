import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/core/theme-context";
import { Button } from "@/ui/Button";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <div className="relative h-5 w-5">
        <Sun className={`absolute inset-0 h-5 w-5 transition-all duration-500 transform ${theme === "dark" ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-amber-500"}`} />
        <Moon className={`absolute inset-0 h-5 w-5 transition-all duration-500 transform ${theme === "light" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-indigo-400"}`} />
      </div>
    </Button>
  );
};
