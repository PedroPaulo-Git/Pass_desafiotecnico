"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  switchUser: (role: UserRole) => Promise<void>;
  getRoleLabel: (role: UserRole) => string;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ROLE: "fleet_current_user_role",
} as const;

const PREDEFINED_USERS = {
  CLIENT: { name: "João Cliente", email: "client@fleet.com" },
  ADMIN: { name: "Maria Admin", email: "admin@fleet.com" },
  DEVELOPER: { name: "Pedro Developer", email: "developer@fleet.com" },
} as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authenticate = useCallback(async (role: UserRole) => {
    try {
      const userData = PREDEFINED_USERS[role];
      const apiUser = await authUser({
        name: userData.name,
        email: userData.email,
        role: role,
      });

      const user: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role as UserRole,
        createdAt: apiUser.createdAt,
        updatedAt: apiUser.updatedAt,
      };

      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, role);
      return user;
    } catch (error) {
      console.warn("⚠️ Fallback auth failed:", error);
      setCurrentUser(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE) as UserRole | null;
        const defaultRole: UserRole = storedRole || "CLIENT";
        await authenticate(defaultRole);
      } catch (error) {
        // Auth failed but we continue
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [authenticate]);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, user.role);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ROLE);
  }, []);

  const switchUser = useCallback(async (role: UserRole) => {
    setIsLoading(true);
    try {
      await authenticate(role);
    } finally {
      setIsLoading(false);
    }
  }, [authenticate]);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "CLIENT": return "Cliente";
      case "ADMIN": return "Administrador";
      case "DEVELOPER": return "Desenvolvedor";
      default: return role;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoading,
      login,
      logout,
      switchUser,
      getRoleLabel,
      isLoggedIn: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
