import { resolveApiBaseUrl } from "./resolveApiBaseUrl";

export const FOOD_PLACEHOLDER = "/images/placeholder-food.svg";

function apiBase(): string {
  return resolveApiBaseUrl();
}

function fileNameFromPath(path: string): string {
  const cleaned = path.replace(/\\/g, "/");
  const segment = cleaned.split("/").filter(Boolean).pop() ?? cleaned;
  try {
    return decodeURIComponent(segment.replace(/\+/g, " "));
  } catch {
    return segment;
  }
}

/** Encode each path segment (keeps slashes). */
function encodePath(path: string): string {
  return path
    .split("/")
    .map((part, index) => {
      if (index === 0 && part === "") return "";
      if (!part) return part;
      const decoded = (() => {
        try {
          return decodeURIComponent(part.replace(/\+/g, " "));
        } catch {
          return part;
        }
      })();
      return encodeURIComponent(decoded);
    })
    .join("/");
}

function joinBase(base: string, path: string): string {
  const encoded = encodePath(path);
  if (!base) return encoded;
  return `${base}${encoded}`;
}

function sanitizeRawPath(raw: string): string {
  return raw
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\.\.+\//, "")
    .replace(/^\.{2,}\//, "");
}

function isInvalidFileToken(file: string): boolean {
  return !file || file === "..." || file === "." || file === "..";
}

/** Filenames that look like food assets stored under the wrong profile path. */
function looksLikeFoodAsset(file: string): boolean {
  return /meal|blueprint|recipe|ingredient|food/i.test(file);
}

/**
 * Map API/DB imagePath values to gateway routes the Vite proxy can forward.
 * Public URLs: /foods/images/{file}, /foods/ingredients/{file}, /profile-images/{file}
 */
export function normalizeMediaPath(raw: string): string {
  const trimmed = sanitizeRawPath(raw);
  if (!trimmed) return "";

  if (trimmed.startsWith("/profile-images/")) {
    return trimmed.split("?")[0];
  }

  if (trimmed.startsWith("/images/userProfiles/")) {
    const rest = trimmed.slice("/images/userProfiles/".length).split("?")[0];
    return rest ? `/profile-images/${rest}` : "";
  }

  if (trimmed.startsWith("/foods/images/") || trimmed.startsWith("/foods/ingredients/")) {
    return trimmed.split("?")[0];
  }

  if (trimmed.startsWith("/images/foods/")) {
    return `/foods/images/${trimmed.slice("/images/foods/".length).split("?")[0]}`;
  }

  if (trimmed.startsWith("/images/ingredients/")) {
    return `/foods/ingredients/${trimmed.slice("/images/ingredients/".length).split("?")[0]}`;
  }

  if (trimmed.startsWith("/foods/")) {
    return trimmed.split("?")[0];
  }

  if (trimmed.startsWith("/")) {
    const file = fileNameFromPath(trimmed);
    if (!isInvalidFileToken(file)) {
      if (trimmed.includes("/ingredients/") || trimmed.includes("ingredient")) {
        return `/foods/ingredients/${file}`;
      }
      if (trimmed.includes("/images/") || trimmed.includes("/foods/")) {
        return `/foods/images/${file}`;
      }
    }
    return trimmed.split("?")[0];
  }

  const file = fileNameFromPath(trimmed);
  if (isInvalidFileToken(file)) return "";

  if (/ingredient/i.test(trimmed)) {
    return `/foods/ingredients/${file}`;
  }

  return `/foods/images/${file}`;
}

function absoluteUrlToRelative(url: string): string | null {
  try {
    const u = new URL(url);
    const local =
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname.endsWith(".localhost");
    if (!local) return null;
    const normalized = normalizeMediaPath(u.pathname);
    if (normalized) return joinBase("", normalized + u.search);
    return joinBase("", u.pathname + u.search);
  } catch {
    return null;
  }
}

function rewriteAbsoluteUrl(url: string, base: string): string {
  const relative = absoluteUrlToRelative(url);
  if (relative) return relative;

  try {
    const u = new URL(url);
    const file = fileNameFromPath(u.pathname);

    if (u.pathname.includes("/profile-images/") || u.pathname.includes("/images/userProfiles/")) {
      const marker = u.pathname.includes("/profile-images/")
        ? "/profile-images/"
        : "/images/userProfiles/";
      const idx = u.pathname.indexOf(marker);
      const suffix = u.pathname.slice(idx + marker.length);
      if (suffix) return joinBase(base, `/profile-images/${fileNameFromPath(suffix)}`);
    }
    if (
      (u.pathname.includes("/images/foods/") || u.pathname.includes("/foods/images/")) &&
      file
    ) {
      return joinBase(base, `/foods/images/${file}`);
    }
    if (
      (u.pathname.includes("/images/ingredients/") ||
        u.pathname.includes("/foods/ingredients/")) &&
      file
    ) {
      return joinBase(base, `/foods/ingredients/${file}`);
    }
  } catch {
    return url;
  }
  return url;
}

export function resolveMediaUrl(path: string | null | undefined): string {
  const candidates = resolveMediaUrlCandidates(path);
  return candidates[0] ?? "";
}

/** Ordered URLs to try (proxy-relative in dev). */
export function resolveMediaUrlCandidates(path: string | null | undefined): string[] {
  if (!path?.trim()) return [];

  const raw = sanitizeRawPath(path);
  const base = apiBase();
  const seen = new Set<string>();
  const add = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };

  const out: string[] = [];

  if (raw.startsWith("blob:") || raw.startsWith("data:")) {
    add(raw);
    return out;
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    const rel = absoluteUrlToRelative(raw);
    if (rel) add(rel);
    add(rewriteAbsoluteUrl(raw, base));
    return out;
  }

  const normalized = normalizeMediaPath(raw);
  if (normalized) add(joinBase(base, normalized));

  const file = fileNameFromPath(raw);
  if (!isInvalidFileToken(file)) {
    if (raw.includes("profile-images") || raw.includes("profile_images")) {
      add(joinBase(base, `/profile-images/${file}`));
    }
    add(joinBase(base, `/foods/images/${file}`));
    if (/ingredient/i.test(raw)) {
      add(joinBase(base, `/foods/ingredients/${file}`));
    }
  }

  return out;
}

/** Profile avatars: try profile route first, then food image path for mis-tagged filenames. */
export function resolveProfileMediaUrlCandidates(
  path: string | null | undefined
): string[] {
  if (!path?.trim()) return [];

  const raw = sanitizeRawPath(path);
  const base = apiBase();
  const file = fileNameFromPath(raw);
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };

  if (raw.startsWith("blob:") || raw.startsWith("data:")) {
    add(raw);
    return out;
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    const rel = absoluteUrlToRelative(raw);
    if (rel) add(rel);
    add(rewriteAbsoluteUrl(raw, base));
    return out;
  }

  const normalized = normalizeMediaPath(raw);
  const foodFirst = !isInvalidFileToken(file) && looksLikeFoodAsset(file);

  if (foodFirst && !isInvalidFileToken(file)) {
    add(joinBase(base, `/foods/images/${file}`));
  }

  if (normalized) add(joinBase(base, normalized));

  if (!isInvalidFileToken(file)) {
    if (raw.includes("profile-images") || raw.includes("profile_images")) {
      add(joinBase(base, `/profile-images/${file}`));
    } else if (!normalized?.startsWith("/profile-images/")) {
      add(joinBase(base, `/profile-images/${file}`));
    }
    if (raw.includes("userProfiles") || normalized?.includes("/images/userProfiles/")) {
      add(joinBase(base, `/profile-images/${file}`));
    }
    if (!foodFirst) {
      add(joinBase(base, `/foods/images/${file}`));
    }
  }

  return out;
}
