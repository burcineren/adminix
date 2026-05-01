import React, { useState } from "react";
import { Theme, ThemeContext } from "./ThemeContext";

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: Theme }> = ({ 
  children, 
  defaultTheme = "light" 
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminix-theme") as Theme;
      if (saved) return saved;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return defaultTheme;
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("adminix-theme", t);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div className={theme === "dark" ? "dark" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
