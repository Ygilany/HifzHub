import * as React from "react";
import { useColorScheme as useNativewindColorScheme } from "nativewind";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: "light" | "dark";
  toggleColorScheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useNativewindColorScheme();
  const [theme, setThemeState] = React.useState<Theme>("system");

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      if (newTheme === "system") {
        // Let nativewind handle system preference
        setColorScheme("system");
      } else {
        setColorScheme(newTheme);
      }
    },
    [setColorScheme]
  );

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      colorScheme: colorScheme ?? "light",
      toggleColorScheme,
    }),
    [theme, setTheme, colorScheme, toggleColorScheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

