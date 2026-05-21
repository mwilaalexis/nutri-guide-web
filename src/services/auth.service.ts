import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterDto,
} from "../Types/global-types";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    let padded = base64;
    while (padded.length % 4 !== 0) {
      padded += "=";
    }
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** True if access JWT is missing, unreadable, or past exp (with skew seconds). */
function isAccessTokenExpired(token: string, skewSec = 45): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const raw = payload.exp;
  if (raw == null) return false;
  const exp = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(exp)) return false;
  return Date.now() / 1000 >= exp - skewSec;
}

export const AuthService = {
  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/api/auth/login", credentials);

    const accessToken = data.accessToken ?? (data as unknown as { AccessToken?: string }).AccessToken;
    const refreshToken = data.refreshToken ?? (data as unknown as { RefreshToken?: string }).RefreshToken;
    const fullName = data.fullName ?? (data as unknown as { FullName?: string }).FullName ?? "";
    const role = data.role ?? (data as unknown as { Role?: string }).Role ?? "";

    if (!accessToken || !refreshToken) {
      throw new Error("Invalid server response: missing tokens. Check API JSON settings and gateway.");
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userName", fullName);
    localStorage.setItem("role", role);

    return {
      ...data,
      accessToken,
      refreshToken,
      fullName,
      role,
    };
  },

  /**
   * Inscription utilisateur
   */
  async register(payload: RegisterDto): Promise<any> {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
  },

  /**
   * Rafraîchissement du token d'accès
   */
  async refresh(refreshTokenValue: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(
      "/api/auth/refresh",
      { refreshToken: refreshTokenValue } as RefreshTokenRequest,
      { skipAuthRefresh: true }
    );

    const accessToken = data.accessToken ?? (data as unknown as { AccessToken?: string }).AccessToken;
    const newRefreshToken = data.refreshToken ?? (data as unknown as { RefreshToken?: string }).RefreshToken;
    if (!accessToken || !newRefreshToken) {
      throw new Error("Invalid server response: missing tokens after refresh.");
    }
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    return { ...data, accessToken, refreshToken: newRefreshToken };
  },

  /**
   * Supprime les données de session locales (tokens, profil UI, rôle).
   * À appeler après un refresh impossible ou une 401 définitive.
   */
  clearLocalSession(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    localStorage.removeItem("profileUrl");
  },

  /**
   * Déconnexion : révocation du refresh côté serveur (si possible) puis nettoyage local.
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        await api.post("/api/auth/logout", { refreshToken }, { skipAuthRefresh: true });
      } catch (error) {
        // On ne veut pas bloquer la déconnexion si le serveur est injoignable
        console.warn("Erreur lors de la révocation du refresh token :", error);
      }
    }

    AuthService.clearLocalSession();
  },

  /**
   * Vérifie si l'utilisateur a une session utilisable (jeton d'accès valide, ou refresh disponible).
   */
  isLoggedIn(): boolean {
    const access = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    if (!access && !refresh) return false;
    if (access && !isAccessTokenExpired(access)) return true;
    return !!refresh;
  },

  /**
   * Récupère l'ID de l'utilisateur actuel à partir du JWT (access token)
   */
  getCurrentUserId(): string | null {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    return (
      (payload.sub as string | undefined) ||
      (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] as string | undefined) ||
      (payload.id as string | undefined) ||
      (payload.userId as string | undefined) ||
      null
    );
  },

  /** Email from access token (same claim the notification service uses for self-test). */
  getCurrentUserEmail(): string | null {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return (
      (payload.email as string | undefined) ||
      (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string | undefined) ||
      null
    );
  },

  /**
   * Récupère le rôle de l'utilisateur actuel
   */
  getCurrentUserRole(): string | null {
    return localStorage.getItem("role");
  },

  /**
   * Récupère le nom complet de l'utilisateur actuel
   */
  getCurrentUserName(): string | null {
    return localStorage.getItem("userName");
  },

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const userRole = localStorage.getItem("role");
    return (userRole ?? "").toLowerCase() === role.toLowerCase();
  },
};

export default AuthService;