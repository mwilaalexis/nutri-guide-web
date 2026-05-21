export type ColorMode = "light" | "dark";
export type PaletteId =
  | "forest"
  | "ocean"
  | "mono"
  | "berry"
  | "slate"
  | "nord"
  | "mocha"
  | "everforest"
  | "tokyo"
  | "rosepine"
  | "midnight"
  | "ember"
  | "sage"
  | "dracula"
  | "onedark"
  | "gruvbox"
  | "kanagawa";

/** Palettes optimisées pour le mode sombre (affichées en premier dans Réglages). */
export const DARK_PALETTES: PaletteId[] = [
  "mocha",
  "nord",
  "tokyo",
  "rosepine",
  "dracula",
  "onedark",
  "everforest",
  "gruvbox",
  "kanagawa",
  "midnight",
  "ember",
  "sage",
  "ocean",
  "berry",
  "forest",
  "slate",
  "mono",
];

export const THEME_STORAGE_KEY = "nutriguide-theme";
export const PALETTE_STORAGE_KEY = "nutriguide-palette";

/** 60-30-10 : neutre · marque · CTA */
export type PaletteRatio = {
  /** 60 % fond neutre */
  neutral: string;
  /** 30 % couleur marque */
  brand: string;
  /** 10 % accent CTA */
  cta: string;
};

export const PALETTES: Record<
  PaletteId,
  { label: string; swatch: string; ratio: PaletteRatio }
> = {
  forest: {
    label: "Forest",
    swatch: "#636B2F",
    ratio: { neutral: "#F6F7F4", brand: "#3D4127", cta: "#4A8C31" },
  },
  ocean: {
    label: "Azur",
    swatch: "#6A89A7",
    ratio: { neutral: "#F5F7FA", brand: "#384959", cta: "#2B7DE9" },
  },
  mono: {
    label: "Mono",
    swatch: "#2B2B2B",
    ratio: { neutral: "#F7F7F7", brand: "#2B2B2B", cta: "#1A1A1A" },
  },
  berry: {
    label: "Berry",
    swatch: "#505081",
    ratio: { neutral: "#F8F8FC", brand: "#272757", cta: "#5B4FD6" },
  },
  slate: {
    label: "Slate",
    swatch: "#6D8196",
    ratio: { neutral: "#F7F7F2", brand: "#4A4A4A", cta: "#0D9488" },
  },
  nord: {
    label: "Nord",
    swatch: "#5E81AC",
    ratio: { neutral: "#ECEFF4", brand: "#5E81AC", cta: "#A3BE8C" },
  },
  mocha: {
    label: "Mocha",
    swatch: "#CBA6F7",
    ratio: { neutral: "#EFF1F5", brand: "#8839EF", cta: "#40A02B" },
  },
  everforest: {
    label: "Everforest",
    swatch: "#A7C080",
    ratio: { neutral: "#EFEBE4", brand: "#5C6F64", cta: "#E69875" },
  },
  tokyo: {
    label: "Tokyo Night",
    swatch: "#7AA2F7",
    ratio: { neutral: "#E6E7ED", brand: "#565F89", cta: "#9ECE6A" },
  },
  rosepine: {
    label: "Rosé Pine",
    swatch: "#C4A7E7",
    ratio: { neutral: "#FAF4ED", brand: "#907AA9", cta: "#D7827E" },
  },
  midnight: {
    label: "Midnight",
    swatch: "#3D5A80",
    ratio: { neutral: "#E8EEF4", brand: "#3D5A80", cta: "#EE6C4D" },
  },
  ember: {
    label: "Ember",
    swatch: "#C45C3E",
    ratio: { neutral: "#F5EDE8", brand: "#8B3A2A", cta: "#F4A261" },
  },
  sage: {
    label: "Sage",
    swatch: "#7D9B76",
    ratio: { neutral: "#F0F4EF", brand: "#5C7356", cta: "#A8C686" },
  },
  dracula: {
    label: "Dracula",
    swatch: "#BD93F9",
    ratio: { neutral: "#F8F8F2", brand: "#6272A4", cta: "#50FA7B" },
  },
  onedark: {
    label: "One Dark",
    swatch: "#61AFEF",
    ratio: { neutral: "#E8E8E8", brand: "#528BCC", cta: "#98C379" },
  },
  gruvbox: {
    label: "Gruvbox",
    swatch: "#FE8019",
    ratio: { neutral: "#FBF1C7", brand: "#458588", cta: "#B8BB26" },
  },
  kanagawa: {
    label: "Kanagawa",
    swatch: "#7E9CD8",
    ratio: { neutral: "#DCD7BA", brand: "#727169", cta: "#98BB6C" },
  },
};

export const DEFAULT_MODE: ColorMode = "light";
export const DEFAULT_PALETTE: PaletteId = "forest";

export function isColorMode(value: string | null): value is ColorMode {
  return value === "light" || value === "dark";
}

const LEGACY_PALETTE_ALIASES: Record<string, PaletteId> = {
  sunset: "mono",
};

export function isPaletteId(value: string | null): value is PaletteId {
  if (value == null) return false;
  if (value in PALETTES) return true;
  return value in LEGACY_PALETTE_ALIASES;
}

export function resolvePaletteId(value: string | null): PaletteId {
  if (value != null && value in PALETTES) return value as PaletteId;
  if (value != null && value in LEGACY_PALETTE_ALIASES) {
    return LEGACY_PALETTE_ALIASES[value];
  }
  return DEFAULT_PALETTE;
}

export function readStoredTheme(): { mode: ColorMode; palette: PaletteId } {
  if (typeof window === "undefined") {
    return { mode: DEFAULT_MODE, palette: DEFAULT_PALETTE };
  }
  try {
    const modeRaw = localStorage.getItem(THEME_STORAGE_KEY);
    const paletteRaw = localStorage.getItem(PALETTE_STORAGE_KEY);
    return {
      mode: isColorMode(modeRaw) ? modeRaw : DEFAULT_MODE,
      palette: resolvePaletteId(paletteRaw),
    };
  } catch {
    return { mode: DEFAULT_MODE, palette: DEFAULT_PALETTE };
  }
}

export function applyTheme(mode: ColorMode, palette: PaletteId): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.setAttribute("data-palette", palette);
  root.style.colorScheme = mode;
}

export function persistTheme(mode: ColorMode, palette: PaletteId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  } catch {
    /* private mode / quota */
  }
}

/** Run before React paint to avoid theme flash. */
export function initThemeFromStorage(): { mode: ColorMode; palette: PaletteId } {
  const stored = readStoredTheme();
  applyTheme(stored.mode, stored.palette);
  return stored;
}
