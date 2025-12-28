import { api } from "@/lib/axios";

export interface AuthUserInput {
  email: string;
  name?: string;
  role?: "CLIENT" | "ADMIN" | "DEVELOPER";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN" | "DEVELOPER";
  createdAt: string;
  updatedAt: string;
}

export const authUser = async (input: AuthUserInput): Promise<User> => {
  const response = await api.post("/users/auth", input);
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};