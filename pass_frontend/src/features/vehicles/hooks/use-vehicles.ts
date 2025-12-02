import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"
import type { Vehicle, PaginatedResponse, VehicleFilters } from "@/types/vehicle"

// Hooks that encapsulate vehicles API calls with react-query.
// Each hook returns the mutation/query object from react-query so
// callers can interact with `isLoading`, `mutateAsync`, etc.

export function useVehicles(filters: VehicleFilters = {}) {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters.page) params.append("page", String(filters.page))
      if (filters.limit) params.append("limit", String(filters.limit))
      if (filters.plate) params.append("plate", filters.plate)
      if (filters.brand) params.append("brand", filters.brand)
      if (filters.status) params.append("status", filters.status)
      if (filters.category) params.append("category", filters.category)
      if (filters.classification) params.append("classification", filters.classification)
      if (filters.state) params.append("state", filters.state)
      if (filters.sortBy) params.append("sortBy", filters.sortBy)
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)
      // `search` may be provided in filters but is not part of the strict type.
      // Read it defensively and append when present.
      const search = (filters as unknown as { search?: string }).search
      if (search) params.append("search", search)

      const { data } = await api.get<PaginatedResponse<Vehicle>>(`/vehicles?${params.toString()}`)
      return data
    },
  })
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data } = await api.get<Vehicle>(`/vehicles/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vehicle: Partial<Vehicle>) => {
      const { data } = await api.post<Vehicle>("/vehicles", vehicle)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...vehicle }: Partial<Vehicle> & { id: string }) => {
      const { data } = await api.put<Vehicle>(`/vehicles/${id}`, vehicle)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      queryClient.invalidateQueries({ queryKey: ["vehicle", data.id] })
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/vehicles/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })
}
