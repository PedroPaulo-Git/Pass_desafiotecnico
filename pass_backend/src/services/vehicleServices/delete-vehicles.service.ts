import { prisma } from "@/lib/prisma";

export const deleteVehicleService = async (VehicleId: string) => {
    await prisma.vehicle.delete({
        where:{
            id: VehicleId
        }
    });
}