"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
  useMemo,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  pendingTheme: Theme | null;
  toggleTheme: (event: React.MouseEvent<HTMLElement>) => void;
  isTransitioning: boolean;
  transitionOrigin: { x: number; y: number } | null;
  clipPath: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [pendingTheme, setPendingTheme] = useState<Theme | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [clipPath, setClipPath] = useState("circle(0% at 50% 50%)");
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initialTheme);
  }, []);

  const toggleTheme = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isTransitioning) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      // Calcula o raio máximo necessário para cobrir toda a tela
      const maxX = Math.max(x, window.innerWidth - x);
      const maxY = Math.max(y, window.innerHeight - y);
      const maxRadius = Math.sqrt(maxX * maxX + maxY * maxY);

      const newTheme = theme === "light" ? "dark" : "light";

      setTransitionOrigin({ x, y });
      setPendingTheme(newTheme);
      setIsTransitioning(true);
      setClipPath(`circle(0px at ${x}px ${y}px)`);

      // Força o browser a aplicar o estado inicial antes de animar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const duration = 800; // ms
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing: easeInOutCubic
            const eased = progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const currentRadius = eased * maxRadius;
            setClipPath(`circle(${currentRadius}px at ${x}px ${y}px)`);

            if (progress < 1) {
              animationRef.current = requestAnimationFrame(animate);
            } else {
              // Animação completa - aplica o novo tema ANTES de remover overlay
              document.documentElement.classList.remove("light", "dark");
              document.documentElement.classList.add(newTheme);
              localStorage.setItem("theme", newTheme);
              
              // Aguarda o browser aplicar as mudanças antes de remover a overlay
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setTheme(newTheme);
                  setPendingTheme(null);
                  setIsTransitioning(false);
                  setTransitionOrigin(null);
                });
              });
            }
          };

          animationRef.current = requestAnimationFrame(animate);
        });
      });
    },
    [isTransitioning, theme]
  );

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      pendingTheme,
      toggleTheme,
      isTransitioning,
      transitionOrigin,
      clipPath,
    }),
    [theme, pendingTheme, toggleTheme, isTransitioning, transitionOrigin, clipPath]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {/* Camada base - tema atual */}
      <div className="theme-layer-base">
        {children}
      </div>

      {/* Camada de transição - novo tema com clip-path */}
      {isTransitioning && pendingTheme && (
        <div
          className={`theme-layer-overlay ${pendingTheme}`}
          style={{ clipPath }}
        >
          {children}
        </div>
      )}
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
