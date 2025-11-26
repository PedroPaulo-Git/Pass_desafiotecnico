import { prisma } from '../../lib/prisma'


export const listVehiclesService = async () => {
    return await prisma.vehicle.findMany();
}