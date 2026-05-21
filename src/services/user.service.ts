import api from "./api";
import type { UserDto } from "../Types/global-types";

export const UserService = {
  getAll: (page: number = 1, pageSize: number = 10) =>
    api.get<UserDto[]>(
      `/api/user?page=${page}&pageSize=${pageSize}`
    ),

  create: (data: Partial<UserDto>) =>
    api.post("/api/user", data),

  update: (id: string, data: Partial<UserDto>) =>
    api.put(`/api/user/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/user/${id}`),
};
