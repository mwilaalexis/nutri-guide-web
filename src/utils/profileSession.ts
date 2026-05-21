import type { ProfileDto } from "../Types/global-types";
import { ProfileService } from "../services/profile.service";

export function applyProfileToSession(data: ProfileDto): string {
  const url = data.profileUrl?.trim() ?? "";
  localStorage.setItem("profileUrl", url);
  if (data.fullName?.trim()) {
    localStorage.setItem("userName", data.fullName.trim());
  }
  window.dispatchEvent(
    new CustomEvent("profile-updated", {
      detail: { profileUrl: url, fullName: data.fullName },
    })
  );
  return url;
}

/** Load profile from API and persist photo URL + name for navbar / avatar. */
export async function syncProfileToSession(): Promise<string> {
  try {
    const { data } = await ProfileService.getMe();
    return applyProfileToSession(data);
  } catch {
    return localStorage.getItem("profileUrl") ?? "";
  }
}
