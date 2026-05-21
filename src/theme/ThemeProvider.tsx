import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyTheme,
  DEFAULT_MODE,
  DEFAULT_PALETTE,
  initThemeFromStorage,
  persistTheme,
  type ColorMode,
  type PaletteId,
  PALETTES,
  DARK_PALETTES,
} from "./theme";

type ThemeContextValue = {
  mode: ColorMode;
  palette: PaletteId;
  setMode: (mode: ColorMode) => void;
  setPalette: (palette: PaletteId) => void;
  toggleMode: () => void;
  palettes: typeof PALETTES;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initThemeFromStorage);

  const commit = useCallback((mode: ColorMode, palette: PaletteId) => {
    applyTheme(mode, palette);
    persistTheme(mode, palette);
    setState({ mode, palette });
  }, []);

  const setMode = useCallback(
    (mode: ColorMode) => commit(mode, state.palette),
    [commit, state.palette],
  );

  const setPalette = useCallback(
    (palette: PaletteId) => commit(state.mode, palette),
    [commit, state.mode],
  );

  const toggleMode = useCallback(() => {
    const nextMode = state.mode === "dark" ? "light" : "dark";
    const nextPalette =
      nextMode === "dark" && !DARK_PALETTES.includes(state.palette)
        ? "mocha"
        : state.palette;
    commit(nextMode, nextPalette);
  }, [commit, state.mode, state.palette]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: state.mode,
      palette: state.palette,
      setMode,
      setPalette,
      toggleMode,
      palettes: PALETTES,
    }),
    [state.mode, state.palette, setMode, setPalette, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      mode: DEFAULT_MODE,
      palette: DEFAULT_PALETTE,
      setMode: () => {},
      setPalette: () => {},
      toggleMode: () => {},
      palettes: PALETTES,
    };
  }
  return ctx;
}
