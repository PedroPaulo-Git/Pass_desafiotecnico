"use client";

import { useState, useEffect } from "react";

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
  USERS: "fleet_users",
} as const;

// Usuários mockados para demonstração
const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "João Silva",
    email: "joao.silva@cliente.com",
    role: "CLIENT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-2",
    name: "Maria Admin",
    email: "maria.admin@fleet.com",
    role: "ADMIN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-3",
    name: "Carlos Developer",
    email: "carlos.dev@fleet.com",
    role: "DEVELOPER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(MOCK_USERS);

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Verificar se o usuário ainda existe na lista de usuários
        const existingUser = users.find(u => u.id === user.id);
        if (existingUser) {
          setCurrentUser(existingUser);
        } else {
          // Se o usuário não existe mais, limpar o localStorage
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar usuário do localStorage:", error);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [users]);

  // Salvar usuário no localStorage quando mudar
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
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
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;

    // Encontrar um usuário com o role desejado
    const userWithRole = users.find(u => u.role === role);
    if (userWithRole) {
      setCurrentUser(userWithRole);
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
    users,
    login,
    logout,
    switchRole,
    getRoleLabel,
    isLoggedIn: !!currentUser,
  };
}