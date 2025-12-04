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
      const { data } = await api.get<VehicleImage[]>(
        `/vehicles/${vehicleId}/images`
      );
      return data;
    },
    enabled: !!vehicleId,
  });
}

export function useCreateVehicleImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      url,
    }: {
      vehicleId: string;
      url: string;
    }) => {
      const { data } = await api.post<VehicleImage>(
        `/vehicles/${vehicleId}/images`,
        { url }
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["vehicle-images", data.vehicleId],
      });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", data.vehicleId] });
    },
  });
}

export function useDeleteVehicleImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageId,
      vehicleId,
    }: {
      imageId: string;
      vehicleId: string;
    }) => {
      await api.delete(`/images/${imageId}`);
      return { imageId, vehicleId };
    },
    onMutate: async ({ imageId, vehicleId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["vehicle-images", vehicleId],
      });

      // Snapshot the previous value
      const previousImages = queryClient.getQueryData<VehicleImage[]>([
        "vehicle-images",
        vehicleId,
      ]);

      // Optimistically remove the image
      if (previousImages) {
        queryClient.setQueryData<VehicleImage[]>(
          ["vehicle-images", vehicleId],
          previousImages.filter((img) => img.id !== imageId)
        );
      }

      return { previousImages };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousImages) {
        queryClient.setQueryData(
          ["vehicle-images", variables.vehicleId],
          context.previousImages
        );
      }
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ["vehicle-images", data.vehicleId],
        });
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        queryClient.invalidateQueries({
          queryKey: ["vehicle", data.vehicleId],
        });
      }
    },
  });
}
