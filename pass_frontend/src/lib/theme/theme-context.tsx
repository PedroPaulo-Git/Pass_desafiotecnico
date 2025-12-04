"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  useMemo,
  type CSSProperties,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event: React.MouseEvent<HTMLElement>) => void;
  isTransitioning: boolean;
  transitionOrigin: { x: number; y: number } | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define theme variables directly from globals.css to ensure they are applied
// via inline styles, overriding any inherited variables from the <html> tag.
const lightThemeVars: CSSProperties = {
  "--background": "rgb(250, 250, 250)",
  "--foreground": "oklch(0.145 0 0)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.145 0 0)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(8.467% 0.00001 271.152)",
  "--primary": "oklch(0.6845 0.1402 232.33)",
  "--primary-foreground": "oklch(0.985 0 0)",
  "--secondary": "oklch(0.97 0 0)",
  "--secondary-foreground": "oklch(0.205 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  "--accent": "oklch(0.97 0 0)",
  "--accent-foreground": "oklch(0.205 0 0)",
  "--destructive": "oklch(0.577 0.245 27.325)",
  "--destructive-foreground": "oklch(0.985 0 0)",
  "--border": "oklch(0.922 0 0)",
  "--input": "oklch(0.922 0 0)",
  "--ring": "oklch(0.6845 0.1402 232.33)",
  "--radius": "0.5rem",
  "--sidebar": "rgb(250, 250, 250)",
  "--sidebar-foreground": "oklch(0.145 0 0)",
  "--sidebar-primary": "oklch(0.6845 0.1402 232.33)",
  "--sidebar-primary-foreground": "oklch(0.985 0 0)",
  "--sidebar-accent": "oklch(0.97 0 0)",
  "--sidebar-accent-foreground": "oklch(0.205 0 0)",
  "--sidebar-border": "oklch(0.922 0 0)",
  "--sidebar-ring": "oklch(0.6845 0.1402 232.33)",
  "--success": "oklch(0.55 0.2 145)",
  "--success-foreground": "oklch(0.985 0 0)",
} as CSSProperties;

const darkThemeVars: CSSProperties = {
  "--background": "oklch(20.019% 0.00002 271.152)",
  "--foreground": "oklch(0.985 0 0)",
  "--card": "oklch(0.15 0 0)",
  "--card-foreground": "oklch(0.985 0 0)",
  "--popover": "oklch(0.15 0 0)",
  "--popover-foreground": "oklch(0.985 0 0)",
  "--primary": "oklch(0.6845 0.1402 232.33)",
  "--primary-foreground": "oklch(0.12 0 0)",
  "--secondary": "oklch(0.22 0 0)",
  "--secondary-foreground": "oklch(0.985 0 0)",
  "--muted": "oklch(0.22 0 0)",
  "--muted-foreground": "oklch(0.708 0 0)",
  "--accent": "oklch(0.22 0 0)",
  "--accent-foreground": "oklch(0.985 0 0)",
  "--destructive": "oklch(0.45 0.2 25)",
  "--destructive-foreground": "oklch(0.985 0 0)",
  "--border": "oklch(0.25 0 0)",
  "--input": "oklch(0.25 0 0)",
  "--ring": "oklch(0.6845 0.1402 232.33)",
  "--sidebar": "oklch(20.019% 0.00002 271.152)",
  "--sidebar-foreground": "oklch(0.985 0 0)",
  "--sidebar-primary": "oklch(0.6845 0.1402 232.33)",
  "--sidebar-primary-foreground": "oklch(0.12 0 0)",
  "--sidebar-accent": "oklch(0.22 0 0)",
  "--sidebar-accent-foreground": "oklch(0.985 0 0)",
  "--sidebar-border": "oklch(0.25 0 0)",
  "--sidebar-ring": "oklch(0.6845 0.1402 232.33)",
  "--success": "oklch(0.55 0.2 145)",
  "--success-foreground": "oklch(0.12 0 0)",
} as CSSProperties;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState<{
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    setTheme(savedTheme || "light");
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isTransitioning) return;

      const rect = event.currentTarget.getBoundingClientRect();

      setTransitionOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setIsTransitioning(true);
    },
    [isTransitioning]
  );

  const handleAnimationComplete = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    setIsTransitioning(false);
  };

  const contextValue = useMemo(
    () => ({ theme, toggleTheme, isTransitioning, transitionOrigin }),
    [theme, toggleTheme, isTransitioning, transitionOrigin]
  );
  const topLayerTheme = theme === "light" ? "dark" : "light";

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="bg-background text-foreground" key={theme}>
        {children}
      </div>

      <AnimatePresence>
        {isTransitioning && transitionOrigin && (
          <motion.div
            className="absolute inset-0 bg-background text-foreground"
            style={topLayerTheme === "dark" ? darkThemeVars : lightThemeVars}
            initial={{
              clipPath: `circle(0% at ${transitionOrigin.x}px ${transitionOrigin.y}px)`,
            }}
            animate={{
              clipPath: `circle(150% at ${transitionOrigin.x}px ${transitionOrigin.y}px)`,
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            onAnimationComplete={handleAnimationComplete}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
