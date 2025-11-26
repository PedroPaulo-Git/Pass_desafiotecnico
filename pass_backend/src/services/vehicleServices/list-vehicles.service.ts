import { prisma } from '../../lib/prisma'


export const listVehiclesService = async () => {
    return await prisma.vehicle.findMany();
}

export const listVehicleByIdService = async (VehicleId: string) => {
    return await prisma.vehicle.findUnique({
        where:{
            id: VehicleId
        }
    });
}