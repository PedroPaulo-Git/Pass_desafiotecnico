import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface VehicleImage {
  id: string;
  url: string;
  vehicleId: string;
  createdAt: string;
}

export function useVehicleImages(vehicleId: string) {
  return useQuery({
    queryKey: ["vehicle-images", vehicleId],
    queryFn: async () => {
      const { data } = await api.get<VehicleImage[]>(`/vehicles/${vehicleId}/images`);
      return data;
    },
    enabled: !!vehicleId,
  });
}

export function useCreateVehicleImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, url }: { vehicleId: string; url: string }) => {
      const { data } = await api.post<VehicleImage>(`/vehicles/${vehicleId}/images`, { url });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-images", data.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", data.vehicleId] });
    },
  });
}

export function useDeleteVehicleImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, vehicleId }: { imageId: string; vehicleId: string }) => {
      await api.delete(`/images/${imageId}`);
      return { imageId, vehicleId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-images", data.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", data.vehicleId] });
    },
  });
}
