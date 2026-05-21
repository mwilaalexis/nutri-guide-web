import type { ProfileDto } from "../Types/global-types";
import api from "./api";

export const ProfileService = {
  getMe: () => api.get<ProfileDto>("/api/profile/me"),
  getById: (id: string) => api.get(`/api/profile/${id}`),

  update: (data: FormData) =>
    api.put("/api/profile", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }),

  create: (data: FormData) =>
    api.post("/api/profile", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }),

  delete: () => api.delete("/api/profile"),
};
