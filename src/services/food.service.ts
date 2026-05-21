import api from "./api";
import { ProfileService } from "./profile.service";
import type { FoodDto } from "../Types/global-types";

async function getUserFilters() {
  const res = await ProfileService.getMe();
  const profile = res.data;

  return {
    dietStyle: profile?.dietType || "",
    avoidTags: profile?.allergies?.join(",") || "",
  };
}

export const FoodService = {
  getAll: (
    dietStyle?: string,
    avoidTags?: string,
    page = 1,
    pageSize = 10,
    search?: string,
  ) =>
    api.get<FoodDto[]>(`/api/foods`, {
      params: {
        dietStyle,
        avoidTags,
        page,
        pageSize,
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
    }),

  getCompatible: async () => {
    const { dietStyle, avoidTags } = await getUserFilters();

    return api.get<FoodDto[]>(`/api/foods/compatible`, {
      params: { dietStyle, avoidTags },
    });
  },

  getById: (id: string) => api.get<FoodDto>(`/api/foods/${id}`),

  create: (data: FormData) =>
    api.post("/api/foods", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: FormData) =>
    api.put(`/api/foods/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id: string) => api.delete(`/api/foods/${id}`),
};
