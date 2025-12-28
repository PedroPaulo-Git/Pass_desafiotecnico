// src/features/helpdesk/hooks/use-helpdesk.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { helpdeskAPI, helpdeskMockAPI } from "../api/helpdeskAPI";
import { useBackendStatus } from "./use-backend-status";
import {
  Helpdesk,
  HelpdeskFilters,
  CreateHelpdeskInput,
  UpdateHelpdeskInput,
  PaginatedHelpdeskResponse
} from "../types/helpdesk";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

// Hook personalizado que aplica filtros baseado na role do usuário
export function useHelpdeskWithRoleFilters(additionalFilters: HelpdeskFilters = {}) {
  const { currentUser } = useAuth();
  const { status: backendStatus } = useBackendStatus();
  const queryClient = useQueryClient();

  // Aplicar filtros baseado na role
  const roleBasedFilters: HelpdeskFilters = { ...additionalFilters };

  if (currentUser) {
    switch (currentUser.role) {
      case "CLIENT":
        // Cliente vê apenas seus chamados
        roleBasedFilters.clientId = currentUser.id;
        break;
      case "DEVELOPER":
        // Developer vê apenas chamados atribuídos a ele
        roleBasedFilters.assignedUserId = currentUser.id;
        break;
      case "ADMIN":
        // Admin vê todos os chamados (sem filtro adicional)
        // Temporariamente removendo filtro por status para debug
        // roleBasedFilters.status = "ABERTO";
        break;
    }
  }

  // Choose API based on backend status. Treat "checking" as online to avoid
  // briefly switching to mocks while the health check runs.
  const api = backendStatus === "offline" ? helpdeskMockAPI : helpdeskAPI;

  return useQuery({
    queryKey: ["helpdesk", roleBasedFilters, backendStatus, currentUser?.role, currentUser?.id],
    queryFn: async () => {
      // Try real API first, fallback to mock on error
      if (backendStatus === "online") {
        try {
          const result = await helpdeskAPI.getAll(roleBasedFilters);
          return result;
        } catch (error) {
          return helpdeskMockAPI.getAll(roleBasedFilters);
        }
      } else {
        return helpdeskMockAPI.getAll(roleBasedFilters);
      }
    },
    staleTime: backendStatus === "online" ? 30000 : Infinity,
    gcTime: backendStatus === "online" ? 300000 : Infinity,
    enabled: !!currentUser, // Só executa quando há usuário
  });
}

// Main hook for helpdesk operations (mantido para compatibilidade)
export function useHelpdesk(filters: HelpdeskFilters = {}) {
  const { status: backendStatus } = useBackendStatus();
  const queryClient = useQueryClient();

  // Choose API based on backend status. Treat "checking" as online.
  const api = backendStatus === "offline" ? helpdeskMockAPI : helpdeskAPI;

  return useQuery({
    queryKey: ["helpdesk", filters, backendStatus],
    queryFn: () => api.getAll(filters),
    staleTime: backendStatus === "online" ? 30000 : Infinity, // 30s for online, never stale for offline
    gcTime: backendStatus === "online" ? 300000 : Infinity, // 5min for online, never garbage collect for offline
  });
}

// Hook for single helpdesk ticket
export function useHelpdeskById(id: string) {
  const { status: backendStatus } = useBackendStatus();
  const api = backendStatus === "offline" ? helpdeskMockAPI : helpdeskAPI;

  return useQuery({
    queryKey: ["helpdesk", id, backendStatus],
    queryFn: async () => {
      // Try real API first, fallback to mock on error
      if (backendStatus === "online") {
        try {
          return await helpdeskAPI.getById(id);
        } catch (error) {
          return helpdeskMockAPI.getById(id);
        }
      } else {
        return helpdeskMockAPI.getById(id);
      }
    },
    enabled: !!id,
    staleTime: backendStatus === "online" ? 30000 : Infinity,
    gcTime: backendStatus === "online" ? 300000 : Infinity,
  });
}

// Hook for creating helpdesk tickets
export function useCreateHelpdesk() {
  const { status: backendStatus } = useBackendStatus();
  const queryClient = useQueryClient();
  const api = backendStatus === "offline" ? helpdeskMockAPI : helpdeskAPI;

  return useMutation({
    mutationFn: async (ticket: CreateHelpdeskInput) => {
      // Try real API first, fallback to mock on error
      if (backendStatus === "online") {
        try {
          return await helpdeskAPI.create(ticket);
        } catch (error) {
          return helpdeskMockAPI.create(ticket);
        }
      } else {
        return helpdeskMockAPI.create(ticket);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch helpdesk queries
      queryClient.invalidateQueries({ queryKey: ["helpdesk"] });

      // Show success toast
      toast.success(
        backendStatus === "online"
          ? `Chamado ${data.ticketNumber} criado com sucesso!`
          : "Chamado criado com sucesso (modo offline)"
      );
    },
    onError: (error) => {
      toast.error(
        `Erro ao criar chamado: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    },
  });
}

// Hook for updating helpdesk tickets
export function useUpdateHelpdesk() {
  const { status: backendStatus } = useBackendStatus();
  const queryClient = useQueryClient();
  const api = backendStatus === "online" ? helpdeskAPI : helpdeskMockAPI;

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateHelpdeskInput }) => {
      // Try real API first, fallback to mock on error
      if (backendStatus === "online") {
        try {
          return await helpdeskAPI.update(id, updates);
        } catch (error) {
          return helpdeskMockAPI.update(id, updates);
        }
      } else {
        return helpdeskMockAPI.update(id, updates);
      }
    },
    onSuccess: (data) => {
      // Invalidate specific ticket and list queries
      queryClient.invalidateQueries({ queryKey: ["helpdesk"] });
      queryClient.invalidateQueries({ queryKey: ["helpdesk", data.id] });

      toast.success("Chamado atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(
        `Erro ao atualizar chamado: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    },
  });
}

// Hook for deleting helpdesk tickets
export function useDeleteHelpdesk() {
  const { status: backendStatus } = useBackendStatus();
  const queryClient = useQueryClient();
  const api = backendStatus === "online" ? helpdeskAPI : helpdeskMockAPI;

  return useMutation({
    mutationFn: async (id: string) => {
      // Try real API first, fallback to mock on error
      if (backendStatus === "online") {
        try {
          return await helpdeskAPI.delete(id);
        } catch (error) {
          return helpdeskMockAPI.delete(id);
        }
      } else {
        return helpdeskMockAPI.delete(id);
      }
    },
    onSuccess: () => {
      // Invalidate helpdesk queries
      queryClient.invalidateQueries({ queryKey: ["helpdesk"] });

      toast.success("Chamado excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(
        `Erro ao excluir chamado: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    },
  });
}