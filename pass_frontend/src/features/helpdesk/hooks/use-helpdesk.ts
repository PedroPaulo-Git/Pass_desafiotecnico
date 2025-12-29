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
      // For create, don't fallback to mock on error - let the error propagate
      if (backendStatus === "online") {
        return await helpdeskAPI.create(ticket);
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
      // For update, don't fallback to mock on error - let the error propagate
      if (backendStatus === "online") {
        return await helpdeskAPI.update(id, updates);
      } else {
        return helpdeskMockAPI.update(id, updates);
      }
    },
    onMutate: async ({ id, updates }: { id: string; updates: UpdateHelpdeskInput }) => {
      await queryClient.cancelQueries({ queryKey: ["helpdesk"], exact: false });

      // Snapshot previous values for rollback
      const previousQueries = queryClient.getQueriesData({ queryKey: ["helpdesk"], exact: false });

      // Optimistically update all cached helpdesk queries (lists and single ticket)
      previousQueries.forEach(([key, value]) => {
        try {
          // If this cached value is a paginated response with items
          if (value && typeof value === "object" && (value as any).items) {
            const pag = value as any;
            const newItems = pag.items.map((it: any) => (it.id === id ? { ...it, ...updates } : it));
            queryClient.setQueryData(key as any, { ...pag, items: newItems });
          } else if (value && typeof value === "object" && (value as any).id) {
            // Single ticket cached under ['helpdesk', id]
            const ticket = value as any;
            if (ticket.id === id) {
              queryClient.setQueryData(key as any, { ...ticket, ...updates });
            }
          }
        } catch (e) {
          // ignore individual cache update errors
        }
      });

      // Also update the specific ticket cache
      const ticketData = queryClient.getQueryData(["helpdesk", id]);
      if (ticketData) {
        queryClient.setQueryData(["helpdesk", id], { ...ticketData, ...updates } as any);
      }

      return { previousQueries };
    },
    onSuccess: (data, variables, context: any) => {
      // Ensure server response is reflected and then refetch/validate
      queryClient.setQueryData(["helpdesk", data.id], data as any);
      queryClient.getQueriesData({ queryKey: ["helpdesk"], exact: false }).forEach(([key, value]) => {
        if (value && typeof value === "object" && (value as any).items) {
          const pag = value as any;
          const newItems = pag.items.map((it: any) => (it.id === data.id ? data : it));
          queryClient.setQueryData(key as any, { ...pag, items: newItems });
        }
      });

      toast.success("Chamado atualizado com sucesso!");
    },
    onError: (error, variables, context: any) => {
      // Rollback: restore previous queries snapshot if available
      if (context?.previousQueries && Array.isArray(context.previousQueries)) {
        context.previousQueries.forEach(([key, value]: any) => {
          try {
            queryClient.setQueryData(key, value);
          } catch (e) {
            // ignore individual restore errors
          }
        });
      }

      toast.error(
        `Erro ao atualizar chamado: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    },
    onSettled: () => {
      // After mutation settles, refetch to ensure server is source of truth
      queryClient.invalidateQueries({ queryKey: ["helpdesk"], exact: false });
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
      // For delete, don't fallback to mock on error - let the error propagate
      if (backendStatus === "online") {
        return await helpdeskAPI.delete(id);
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