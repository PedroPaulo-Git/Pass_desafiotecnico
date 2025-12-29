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
  CURRENT_USER_ROLE: "fleet_current_user_role",
} as const;

// Usuários pré-definidos para cada role
const PREDEFINED_USERS = {
  CLIENT: { name: "João Cliente", email: "client@fleet.com" },
  ADMIN: { name: "Maria Admin", email: "admin@fleet.com" },
  DEVELOPER: { name: "Pedro Developer", email: "developer@fleet.com" },
} as const;

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Autenticar usuário no backend na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Tentar carregar a role do localStorage
        const storedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE) as UserRole | null;
        const defaultRole: UserRole = storedRole || "CLIENT";

        console.log(`🔄 Tentando conectar com backend como ${defaultRole}...`);
        const userData = PREDEFINED_USERS[defaultRole];
        const apiUser = await authUser({
          name: userData.name,
          email: userData.email,
          role: defaultRole,
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

  // Salvar a role no localStorage quando mudar
  useEffect(() => {
    try {
      if (currentUser?.role) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, currentUser.role);
      }
    } catch (error) {
      console.error("Erro ao salvar role no localStorage:", error);
    }
  }, [currentUser?.role]);

  // Sincronizar mudanças de auth entre instâncias do hook (mesma aba ou outras abas)
  useEffect(() => {
    const handleAuthChanged = () => {
      try {
        const storedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE) as UserRole | null;
        if (storedRole && PREDEFINED_USERS[storedRole]) {
          // Re-autenticar com a nova role se necessário
          const userData = PREDEFINED_USERS[storedRole];
          authUser({
            name: userData.name,
            email: userData.email,
            role: storedRole,
          }).then(apiUser => {
            const user: User = {
              id: apiUser.id,
              name: apiUser.name,
              email: apiUser.email,
              role: apiUser.role,
              createdAt: apiUser.createdAt,
              updatedAt: apiUser.updatedAt,
            };
            setCurrentUser(user);
          }).catch(err => {
            console.warn("Erro ao re-autenticar:", err);
          });
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Erro ao sincronizar usuário a partir do localStorage:", err);
      }
    };

    const handleStorage = (ev: StorageEvent) => {
      if (ev.key === STORAGE_KEYS.CURRENT_USER_ROLE) {
        handleAuthChanged();
      }
    };

    window.addEventListener("auth:changed", handleAuthChanged);
    window.addEventListener("storage", handleStorage as any);

    return () => {
      window.removeEventListener("auth:changed", handleAuthChanged);
      window.removeEventListener("storage", handleStorage as any);
    };
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, user.role);
    } catch (err) {
      /* ignore */
    }
    window.dispatchEvent(new Event("auth:changed"));
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ROLE);
    } catch (err) {
      /* ignore */
    }
    window.dispatchEvent(new Event("auth:changed"));
  };

  const switchUser = async (role: UserRole) => {
    try {
      console.log(`🔄 Trocando para usuário ${role}...`);
      const userData = PREDEFINED_USERS[role];
      const apiUser = await authUser({
        name: userData.name,
        email: userData.email,
        role,
      });

      const user: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        createdAt: apiUser.createdAt,
        updatedAt: apiUser.updatedAt,
      };

      console.log("✅ Usuário trocado:", user.name);
      setCurrentUser(user);
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, role);
      } catch (err) {
        /* ignore */
      }
      window.dispatchEvent(new Event("auth:changed"));
    } catch (error) {
      console.warn("⚠️ Erro ao trocar usuário:", (error as Error).message);
      // Não fazer fallback, manter usuário atual
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
    switchUser,
    getRoleLabel,
    isLoggedIn: !!currentUser,
  };
}