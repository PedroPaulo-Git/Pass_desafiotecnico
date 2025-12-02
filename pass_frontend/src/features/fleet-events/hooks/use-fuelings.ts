import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/axios"

type PaginatedResponse<T> = { items: T[]; page: number; limit: number; total: number; totalPages: number }

type Fueling = any

export type FuelingFilters = {
  page?: number
  limit?: number
  provider?: string
  fuelType?: string
  dateFrom?: string
  dateTo?: string
  minOdometer?: number
  maxOdometer?: number
  minLiters?: number
  maxLiters?: number
  minUnitPrice?: number
  maxUnitPrice?: number
  totalValue?: number
  sortBy?: string
  sortOrder?: string
  search?: string
}

export function useFuelings(filters: FuelingFilters = {}) {
  return useQuery({
    queryKey: ["fuelings", filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters.page) params.append("page", String(filters.page))
      if (filters.limit) params.append("limit", String(filters.limit))
      if (filters.provider) params.append("provider", filters.provider)
      if (filters.fuelType) params.append("fuelType", filters.fuelType)
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom)
      if (filters.dateTo) params.append("dateTo", filters.dateTo)
      if (filters.minOdometer !== undefined) params.append("minOdometer", String(filters.minOdometer))
      if (filters.maxOdometer !== undefined) params.append("maxOdometer", String(filters.maxOdometer))
      if (filters.minLiters !== undefined) params.append("minLiters", String(filters.minLiters))
      if (filters.maxLiters !== undefined) params.append("maxLiters", String(filters.maxLiters))
      if (filters.minUnitPrice !== undefined) params.append("minUnitPrice", String(filters.minUnitPrice))
      if (filters.maxUnitPrice !== undefined) params.append("maxUnitPrice", String(filters.maxUnitPrice))
      if (filters.totalValue !== undefined) params.append("totalValue", String(filters.totalValue))
      if (filters.sortBy) params.append("sortBy", filters.sortBy)
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder)
      if ((filters as any).search) params.append("search", (filters as any).search)

      const { data } = await api.get<PaginatedResponse<Fueling>>(`/fuelings?${params.toString()}`)
      return data
    },
  })
}

export function useFueling(id: string) {
  return useQuery({
    queryKey: ["fueling", id],
    queryFn: async () => {
      const { data } = await api.get<Fueling>(`/fuelings/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateFueling() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post<Fueling>(`/fuelings`, payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fuelings"] })
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      if (data && (data as any).vehicleId) {
        queryClient.invalidateQueries({ queryKey: ["vehicle", (data as any).vehicleId] })
      }
    },
  })
}

export function useUpdateFueling() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const { data } = await api.put<Fueling>(`/fuelings/${id}`, payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fuelings"] })
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      if (data && (data as any).vehicleId) {
        queryClient.invalidateQueries({ queryKey: ["vehicle", (data as any).vehicleId] })
      }
    },
  })
}

export function useDeleteFueling() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/fuelings/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuelings"] })
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })
}

export default useFuelings
