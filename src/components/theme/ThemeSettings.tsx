import { useMemo } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import type { PaletteId } from "../../theme/theme";
import { DARK_PALETTES } from "../../theme/theme";

export default function ThemeSettings() {
  const { mode, palette, setMode, setPalette, palettes } = useTheme();

  const paletteOrder = useMemo(() => {
    const ids = Object.keys(palettes) as PaletteId[];
    if (mode === "dark") {
      const featured = DARK_PALETTES.filter((id) => id in palettes);
      const rest = ids.filter((id) => !featured.includes(id));
      return [...featured, ...rest];
    }
    return ids;
  }, [mode, palettes]);

  const darkSet = useMemo(() => new Set(DARK_PALETTES), []);

  return (
    <div className="theme-settings theme-settings--page">
      <section className="theme-settings__block">
        <h2 className="theme-settings__heading">Appearance</h2>
        <p className="theme-settings__desc">
          <strong>60-30-10 :</strong> 60% neutral background, 30% brand color (titles, menus, frames),
          10% vivid accent reserved for primary buttons and links only.
        </p>
        {mode === "dark" && (
          <p className="theme-settings__desc theme-settings__desc--dark-hint">
            Palettes marquées <span className="theme-settings__dark-tag">Dark</span> sont calibrées pour le mode
            sombre (Nord, Catppuccin Mocha, Tokyo Night, Dracula, Gruvbox, etc.).
          </p>
        )}

        <div className="theme-settings__row">
          <span className="theme-settings__label">Color mode</span>
          <div className="theme-settings__mode-toggle" role="group" aria-label="Color mode">
            <button
              type="button"
              className={[
                "theme-settings__mode-option",
                mode === "light" ? "theme-settings__mode-option--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setMode("light")}
              aria-pressed={mode === "light"}
            >
              Light
            </button>
            <button
              type="button"
              className={[
                "theme-settings__mode-option",
                mode === "dark" ? "theme-settings__mode-option--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setMode("dark")}
              aria-pressed={mode === "dark"}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="theme-settings__row theme-settings__row--stack">
          <span className="theme-settings__label">Color palette</span>
          <div className="theme-settings__palette-grid theme-settings__palette-grid--page">
            {paletteOrder.map((id) => {
              const meta = palettes[id];
              const isDarkPalette = darkSet.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={[
                    "theme-settings__palette-card",
                    palette === id ? "theme-settings__palette-card--active" : "",
                    mode === "dark" && isDarkPalette ? "theme-settings__palette-card--dark" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setPalette(id)}
                  aria-pressed={palette === id}
                  title={`60% ${meta.ratio.neutral} · 30% ${meta.ratio.brand} · 10% ${meta.ratio.cta}`}
                >
                  <span className="theme-settings__ratio-bar" aria-hidden>
                    <span className="theme-settings__ratio-60" style={{ background: meta.ratio.neutral }} />
                    <span className="theme-settings__ratio-30" style={{ background: meta.ratio.brand }} />
                    <span className="theme-settings__ratio-10" style={{ background: meta.ratio.cta }} />
                  </span>
                  <span className="theme-settings__palette-card-label">
                    {meta.label}
                    {mode === "dark" && isDarkPalette ? (
                      <span className="theme-settings__dark-tag">Dark</span>
                    ) : null}
                  </span>
                  <span className="theme-settings__ratio-legend">
                    <span>60</span>
                    <span>30</span>
                    <span>10</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
