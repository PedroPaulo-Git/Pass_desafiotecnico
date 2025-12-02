import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"

type PaginatedResponse<T> = { items: T[]; page: number; limit: number; total: number; totalPages: number }

type Incident = any

export type IncidentFilters = {
  page?: number
  limit?: number
  severity?: string
  classification?: string
  vehicleId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: string
  search?: string
}

export function useIncidents(filters: IncidentFilters = {}) {
  return useQuery({
    queryKey: ["incidents", filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters.page) params.append("page", String(filters.page))
      if (filters.limit) params.append("limit", String(filters.limit))
      if (filters.severity) params.append("severity", filters.severity)
      if (filters.classification) params.append("classification", filters.classification)
      if (filters.vehicleId) params.append("vehicleId", filters.vehicleId)
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.append("dateTo", filters.dateTo)
      if (filters.sortBy) params.append("sortBy", filters.sortBy)
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)
      if ((filters as any).search) params.append("search", (filters as any).search)

      const { data } = await api.get<PaginatedResponse<Incident>>(`/incidents?${params.toString()}`)
      return data
    },
  })
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ["incident", id],
    queryFn: async () => {
      const { data } = await api.get<Incident>(`/incidents/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post<Incident>(`/incidents`, payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      if (data && (data as any).vehicleId) {
        queryClient.invalidateQueries({ queryKey: ["vehicle", (data as any).vehicleId] })
      }
    },
  })
}

export function useUpdateIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await api.put<Incident>(`/incidents/${id}`, payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      if (data && (data as any).vehicleId) {
        queryClient.invalidateQueries({ queryKey: ["vehicle", (data as any).vehicleId] })
      }
    },
  })
}

export function useDeleteIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/incidents/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })
}

export default useIncidents
