import React, { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; defaultTheme?: Theme }> = ({ 
  children, 
  defaultTheme = "light" 
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminix-theme") as Theme;
      if (saved) return saved;
      
      // Try system preference
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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
