import api from "./api";

export const PlansService = {
  generate: (data: any) => api.post("/api/plans/generate", data),
  getById: (id: string) => api.get(`/api/plans/${id}`),
  delete: (id: string) => api.delete(`/api/plans/${id}`),
  getAll: () => api.get("/api/plans"),
  swapMeal: (planId: string, mealId: string, preferedMealId:string|null) =>
    api.put(`/api/plans/${planId}/swap/${mealId}/${preferedMealId}`),
  regenerateDay: (planId: string, dayIndex: number) =>
    api.put(`/api/plans/${planId}/regenerate/day/${dayIndex}`),
  regenerateMeal: (planId: string, mealId: string) =>
    api.put(`/api/plans/${planId}/regenerate/meal/${mealId}`),
  summary: (planId: string) => api.get(`/api/plans/${planId}/summary`),
  duplicate: (planId: string) => api.post(`/api/plans/${planId}/duplicate`),
  exportPdf: (planId: string) =>
    api.get(`/api/plans/${planId}/export/pdf`, { responseType: "blob" }),
};
