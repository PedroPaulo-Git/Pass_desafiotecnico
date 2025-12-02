import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { PaginatedResponse, VehicleDocument } from "@/types/vehicle";
import type { DocumentFilters } from "./types";
export function useVehicleDocuments(filters: DocumentFilters = {}) {
  return useQuery({
    queryKey: ["documents", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));
      if (filters.name) params.append("name", filters.name);
      if (filters.vehicleId) params.append("vehicleId", filters.vehicleId);
      if (filters.activeAlert !== undefined)
        params.append("activeAlert", String(filters.activeAlert));
      if (filters.expiryDateFrom)
        params.append("expiryDateFrom", filters.expiryDateFrom);
      if (filters.expiryDateTo)
        params.append("expiryDateTo", filters.expiryDateTo);
      if (filters.expiringWithinDays !== undefined)
        params.append("expiringWithinDays", String(filters.expiringWithinDays));
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      if ((filters as any).search)
        params.append("search", (filters as any).search);

      const { data } = await api.get<PaginatedResponse<VehicleDocument>>(
        `/documents?${params.toString()}`
      );
      return data;
    },
  });
}

export function useVehicleDocument(vehicleId: string) {
  return useQuery({
    queryKey: ["document", vehicleId],

    queryFn: async () => {
      const id = (vehicleId as any)?.vehicleId ?? vehicleId;
      if (!id) {
        throw new Error("vehicleId is required to create fueling");
      }
      const { data } = await api.get<VehicleDocument>(
        `/vehicles/${id}/documents`
      );
      return data;
    },
    enabled: !!vehicleId,
  });
}

export function useCreateVehicleDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const vehicleId = (payload as any)?.vehicleId;
      if (!vehicleId) {
        throw new Error("vehicleId is required to create fueling");
      }
      const { data } = await api.post<VehicleDocument>(
        `/vehicles/${vehicleId}/documents`,
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      if (data && (data as any).vehicleId) {
        queryClient.invalidateQueries({
          queryKey: ["vehicle", (data as any).vehicleId],
        });
      }
    },
  });
}

export function useUpdateVehicleDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await api.put<VehicleDocument>(
        `/documents/${id}`,
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      if (data && (data as any).vehicleId) {
        queryClient.invalidateQueries({
          queryKey: ["vehicle", (data as any).vehicleId],
        });
      }
    },
  });
}

export function useDeleteVehicleDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export default useVehicleDocuments;
