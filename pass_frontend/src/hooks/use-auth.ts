"use client";

import { useState, useEffect } from "react";
import { authUser, type User as ApiUser } from "@/lib/api/auth";

export type UserRole = "CLIENT" | "ADMIN" | "DEVELOPER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  CURRENT_USER: "fleet_current_user",
} as const;

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Autenticar usuário no backend na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Tentar carregar do localStorage primeiro
        const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setIsLoading(false);
          return;
        }

        // Tentar autenticar no backend com dados padrão
        console.log("🔄 Tentando conectar com backend...");
        const apiUser = await authUser({
          name: "Usuário Demo",
          email: "demo@fleet.com",
          role: "CLIENT" as UserRole,
        });

        const user: User = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role,
          createdAt: apiUser.createdAt,
          updatedAt: apiUser.updatedAt,
        };

        console.log("✅ Usuário autenticado no backend:", user.name);
        setCurrentUser(user);
      } catch (error) {
        console.warn("⚠️ Backend indisponível:", (error as Error).message);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Salvar usuário no localStorage quando mudar
  useEffect(() => {
    try {
      if (currentUser) {
        const userToSave = {
          ...currentUser,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userToSave));
      }
    } catch (error) {
      console.error("Erro ao salvar usuário no localStorage:", error);
    }
  }, [currentUser]);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const switchRole = async (role: UserRole) => {
    if (currentUser) {
      try {
        console.log(`🔄 Trocando role para ${role} no backend...`);
        const updatedUser = await authUser({
          email: currentUser.email,
          name: currentUser.name,
          role,
        });

        const user: User = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        };

        console.log("✅ Role atualizada no backend");
        setCurrentUser(user);
      } catch (error) {
        console.warn("⚠️ Erro ao trocar role no backend:", (error as Error).message);
        // Não fazer fallback, manter usuário atual
      }
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "CLIENT":
        return "Cliente";
      case "ADMIN":
        return "Administrador";
      case "DEVELOPER":
        return "Desenvolvedor";
      default:
        return role;
    }
  };

  return {
    currentUser,
    isLoading,
    login,
    logout,
    switchRole,
    getRoleLabel,
    isLoggedIn: !!currentUser,
  };
}