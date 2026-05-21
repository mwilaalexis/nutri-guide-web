import api from "./api";

export const IngredientsService = {
  getAll: () => api.get("/api/ingredients"),
  create: (data: any) => api.post("/api/ingredients", data),
  getById: (id: string) => api.get(`/api/ingredients/${id}`),
  update: (id: string, data: any) => api.put(`/api/ingredients/${id}`, data),
  delete: (id: string) => api.delete(`/api/ingredients/${id}`),
};
